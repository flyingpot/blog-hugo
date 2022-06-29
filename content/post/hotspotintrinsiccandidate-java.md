+++
categories = []
date = 2022-06-29T18:00:00Z
tags = ["Java", "JDK"]
title = "@HotSpotIntrinsicCandidate和Java即时编译"
url = "/post/hotspot-intrinsic-candidate"

+++
Java为了满足跨平台的需求，将Java代码首先编译成平台无关的字节码，然后通过JVM解释执行。同时，为了尽可能的提高性能引入了即时编译（JIT），会在代码运行时分析热点代码片段将其编译为字节码执行。原理我能讲出来，但是细节方面我就说不出来了。这次我以一个注解为入口，看看JDK源码来了解一下Java即时编译的简单原理。

### HotSpotIntrinsicCandidate注解

之前我在看Netty内存分配逻辑的时候，发现Netty分配内存并没有使用new关键字，而是使用了下面这个方法：

```Java
@HotSpotIntrinsicCandidate  
private Object allocateUninitializedArray0(Class<?> componentType, int length) {  
   // These fallbacks provide zeroed arrays, but intrinsic is not required to  
   // return the zeroed arrays.   if (componentType == byte.class)    return new byte[length];  
   if (componentType == boolean.class) return new boolean[length];  
   if (componentType == short.class)   return new short[length];  
   if (componentType == char.class)    return new char[length];  
   if (componentType == int.class)     return new int[length];  
   if (componentType == float.class)   return new float[length];  
   if (componentType == long.class)    return new long[length];  
   if (componentType == double.class)  return new double[length];  
   return null;  
}
```

这块代码带了@HotSpotIntrinsicCandidate注解（这个注解在JDK16之后变成了@IntrinsicCandidate），它实际上会尝试调用HotSpot JVM的内化的（intrinsified）实现来提高性能，可能是手写汇编代码或者手写中级表示（Intermediate Representation）代码（C++）。

> 这里其实跟JNI（Java Native Interface，对于native方法）有一些像，只不过JNI是固定调用C++代码，而这个注解是动态调用C++中间代码，相当于优化了JVM和native代码之间的联系，让代码更快。这可能也是为什么很多方法既是native，也带intrinsic注解的原因吧。

### 分层编译

从JDK7开始，Java支持分层编译。关于分层编译的定义，可以参考源码[compilationPolicy.hpp](https://github.com/openjdk/jdk/blob/master/src/hotspot/share/compiler/compilationPolicy.hpp)的注释，写的非常清楚，截取一段对于层级的定义如下：

    The system supports 5 execution levels:
    level 0 - interpreter
    level 1 - C1 with full optimization (no profiling)
    level 2 - C1 with invocation and backedge counters
    level 3 - C1 with full profiling (level 2 + MDO)
    level 4 - C2

看起来很复杂，有五个层级，其实理解起来很简单：

1. 执行速度上：0 < 1 < 4，2比1慢，3比2慢（因为需要记录一些信息）
2. 编译时间上：0 < 1 < 4，2和3与1相同
3. JDK会根据C1和C2编译器的排队情况和C1或者解释器执行的统计值决定下一个状态是什么，正常情况下都是从0最终到4，但在优化过于激进的情况下可能会回退状态（比如C2速度和C1相同的情况）。

这里借用一下[美团技术团队](https://tech.meituan.com/)的状态流转图：

![](/images/jit-policy.png)

### 看源码

回到最开始的问题，我很想知道为什么Netty要选用加上@HotSpotIntrinsicCandidate注解的代码，它为什么会比new还快。
首先，所有的@HotSpotIntrinsicCandidate注解定义都在vmIntrinsics.hpp中

```c++
do_intrinsic(_allocateUninitializedArray, jdk_internal_misc_Unsafe, allocateUninitializedArray_name, newArray_signature, F_R)

do_name( allocateUninitializedArray_name, "allocateUninitializedArray0")
```

需要注意的是，这里仅仅做了定义，将Java代码中的allocateUninitializedArray0方法绑定了C++的_allocateUninitializedArray方法，方法实际定义在library_call.cpp中：

```c++
case vmIntrinsics::_allocateUninitializedArray: return inline_unsafe_newArray(true);
```

> 这里library_call.cpp中定义的方法是C2编译优化使用的，我没有在JDK源码中找到allocateUninitializedArray0对应的C1源码，说明C1应该是根据Java方法默认的定义来优化的。

这里指向了这个方法inline_unsafe_newArray，源码如下：

```c++
//-----------------------inline_native_newArray--------------------------  
// private static native Object java.lang.reflect.newArray(Class<?> componentType, int length);  
// private        native Object Unsafe.allocateUninitializedArray0(Class<?> cls, int size);  
bool LibraryCallKit::inline_unsafe_newArray(bool uninitialized) {  
  Node* mirror;  
  Node* count_val; 
// 读取入参，一个是数组元素类型，一个是数组元素数量
  if (uninitialized) {  
    mirror    = argument(1);  
    count_val = argument(2);  
  } else {  
    mirror    = argument(0);  
    count_val = argument(1);  
  }  
  
  mirror = null_check(mirror);  
  // If mirror or obj is dead, only null-path is taken.  
  if (stopped())  return true;  
  
// 定义了两种路径，slow_path对应第一阶段（字节码解释），normal_path对应第五阶段（C2编译优化）
  enum { _normal_path = 1, _slow_path = 2, PATH_LIMIT };
// 定义了C2的图（Ideal Graph）
  RegionNode* result_reg = new RegionNode(PATH_LIMIT);  
  PhiNode*    result_val = new PhiNode(result_reg, TypeInstPtr::NOTNULL);  
  PhiNode*    result_io  = new PhiNode(result_reg, Type::ABIO);  
  PhiNode*    result_mem = new PhiNode(result_reg, Type::MEMORY, TypePtr::BOTTOM);  
  
  bool never_see_null = !too_many_traps(Deoptimization::Reason_null_check);  
  Node* klass_node = load_array_klass_from_mirror(mirror, never_see_null,  
                                                  result_reg, _slow_path);  
  Node* normal_ctl   = control();  
  Node* no_array_ctl = result_reg->in(_slow_path);  
  
  // Generate code for the slow case.  We make a call to newArray().
// 字节码解释执行的逻辑，实际上就会调用定义在allocateUninitializedArray0中的默认实现
  set_control(no_array_ctl);  
  if (!stopped()) {  
    // Either the input type is void.class, or else the  
    // array klass has not yet been cached.  Either the    // ensuing call will throw an exception, or else it    // will cache the array klass for next time.    PreserveJVMState pjvms(this);  
    CallJavaNode* slow_call = NULL;  
    if (uninitialized) {  
      // Generate optimized virtual call (holder class 'Unsafe' is final)  
      slow_call = generate_method_call(vmIntrinsics::_allocateUninitializedArray, false, false);  
    } else {  
      slow_call = generate_method_call_static(vmIntrinsics::_newArray);  
    }  
    Node* slow_result = set_results_for_java_call(slow_call);  
    // this->control() comes from set_results_for_java_call  
    result_reg->set_req(_slow_path, control());  
    result_val->set_req(_slow_path, slow_result);  
    result_io ->set_req(_slow_path, i_o());  
    result_mem->set_req(_slow_path, reset_memory());  
  }  
  
  set_control(normal_ctl);
  // C2编译优化的逻辑
  if (!stopped()) {  
    // Normal case:  The array type has been cached in the java.lang.Class.  
    // The following call works fine even if the array type is polymorphic.    // It could be a dynamic mix of int[], boolean[], Object[], etc.
	// new_array是具体allocate逻辑
	Node* obj = new_array(klass_node, count_val, 0);  // no arguments to push  
    result_reg->init_req(_normal_path, control());  
    result_val->init_req(_normal_path, obj);  
    result_io ->init_req(_normal_path, i_o());  
    result_mem->init_req(_normal_path, reset_memory());  
  
    if (uninitialized) {  
      // Mark the allocation so that zeroing is skipped
      // 这里注释很重要，分配内存的置零被跳过了
      AllocateArrayNode* alloc = AllocateArrayNode::Ideal_array_allocation(obj, &_gvn);  
      alloc->maybe_set_complete(&_gvn);  
    }  
  }  
  // Return the combined state.  
  set_i_o(        _gvn.transform(result_io)  );  
  set_all_memory( _gvn.transform(result_mem));  
  
  C->set_has_split_ifs(true); // Has chance for split-if optimization  
  set_result(result_reg, result_val);  
  return true;  
}
```

结合注释可以看出来，allocateUninitializedArray0除了C2本身的优化之外，还跳过了分配内存的置零阶段。这也符合Java源码里面allocateUninitializedArray0的注释：

> Allocates an array of a given type, but does not do zeroing.

对于new关键字初始化的数组来说，我们知道，JVM会置零这个数组：

```Java
byte[] bytes = new byte[10];
// bytes数组的每一个元素都是0x00
```

实际上，置零这个操作耗时还是挺长的（可以参考stackoverflow的问题[Why is memset slow](https://stackoverflow.com/questions/23374286/why-is-memset-slow)），毕竟相当于一次完整的写入。当然对于分配完数组就写入的情况来说，可能TLB能命中一部分，不至于差距太大。因此源码注释中也提到，只有高性能的场景才需要将new替换掉。并且，使用这个方法需要自己管理好引用和GC。

当然，对于视性能如命的Netty来说，只要能提升性能，这些都是小问题。

### 总结

这次“浅入”JDK源码，原理部分看懂的不多，但是即时编译的流程了解了一些，也明白了为什么Netty要用带有即时编译优化的Unsafe方法替换掉new。希望以后还有机会去真正深入看看JDK源码。

### 参考链接

1. [基本功 | Java即时编译器原理解析及实践](https://tech.meituan.com/2020/10/22/java-jit-practice-in-meituan.html)
2. [JDK源码Github仓库](https://github.com/openjdk/jdk)
3. [HotSpot Intrinsics](https://alidg.me/blog/2020/12/10/hotspot-intrinsics)