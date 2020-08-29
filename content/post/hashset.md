+++
date = 2020-08-26T16:00:00Z
draft = true
title = "由缓存穿透想到的——HashSet和布隆过滤器"
url = "bloomfilter"

+++
## 一、缓存穿透

设想一种高并发场景，后台服务在查询数据库（如Mysql）之前先查缓存（如Redis）。如果缓存失效，大量无法在数据库中查询到结果的请求（如数据库中没有的ID查询）没有在Redis中查到内容，就会“穿透”我们的缓存服务，直接打到数据库上。这就有可能导致数据库因为压力过大而挂掉。

> 这里要注意，缓存穿透与缓存击穿是不同的，击穿主要指大量请求查询某一个key的时候，这个key在缓存中是失效状态。这些查询就会“击穿”缓存。还有一个概念叫缓存雪崩，指的就是很多key都在缓存中失效了（或者干脆缓存服务挂掉了），导致数据库被打挂的情况。
>
> 可以这样理解，从穿透到击穿再到雪崩，是一个严重程度逐步递进的过程。

针对缓存穿透的问题，有两个解决方法：一个是缓存空值，也就是将值为null写入缓存；另一个就是加入一个过滤器，这个过滤器的作用是识别key是否在数据库中存在，如果存在则继续进入缓存——数据库查询，如果不存在则直接返回结果。

这种过滤器方法实际上可以用HashSet来实现。

## 二、HashSet的原理

在Java语言中，HashSet是一个数据结构实现类，实现了Set（集合）接口。这个数据结构主要特点就是无序并且唯一。对于缓存穿透的场景，只需要将数据库中的所有key写入HashSet（add方法），然后就可以通过contains方法查到key是否存在，从而实现这个过滤器。

那么HashSet是如何实现add过程的去重和contains方法的呢？这时候就需要看代码了。可以发现HashSet实际上是复用了HashMap的方法（定义了一个空对象PRESENT填充到value中，十分巧妙）：

```java
    private transient HashMap<E,Object> map;

    // Dummy value to associate with an Object in the backing Map
    private static final Object PRESENT = new Object();

    /**
     * Constructs a new, empty set; the backing <tt>HashMap</tt> instance has
     * default initial capacity (16) and load factor (0.75).
     */
    public HashSet() {
        map = new HashMap<>();
    }
    public boolean add(E e) {
        return map.put(e, PRESENT)==null;
    }
    public boolean contains(Object o) {
        return map.containsKey(o);
    }
```

那么就看一下HashMap的put和containsKey方法是如何实现的：

```Java
	public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }
    
    static final int hash(Object key) {
        int h;
        // 与hashCode()的结果做异或的目的是为了增加低位的扰动，减小碰撞
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }

    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        if ((tab = table) == null || (n = tab.length) == 0)
            // 扩容逻辑
            n = (tab = resize()).length;
        // (n-1) & hash等于hash % n,这里是找到写入的值落在哪个桶里
        if ((p = tab[i = (n - 1) & hash]) == null)
            // 如果桶是空的，直接写入
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            // 第一个节点冲突，退出
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            // 节点是树节点（当前是红黑树而不是链表），走树的相关逻辑
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            // 其他情况（链表，且第一个节点不是）
            else {
                // 遍历链表
                for (int binCount = 0; ; ++binCount) {
                    // 插入链表最后
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            // 链表长度超过阈值，转红黑树
                            treeifyBin(tab, hash);
                        break;
                    }
                    // 在链表中间发现冲突
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            // 找到重复key值，开始替换value逻辑
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
    
    // constainsKey方法与上面的逻辑类似
    public boolean containsKey(Object key) {
        return getNode(hash(key), key) != null;
    }
    
    final Node<K,V> getNode(int hash, Object key) {
        Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
        if ((tab = table) != null && (n = tab.length) > 0 &&
            (first = tab[(n - 1) & hash]) != null) {
            if (first.hash == hash && // always check first node
                ((k = first.key) == key || (key != null && key.equals(k))))
                return first;
            if ((e = first.next) != null) {
                if (first instanceof TreeNode)
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                do {
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        return e;
                } while ((e = e.next) != null);
            }
        }
        return null;
    }
```

可以看到HashMap是数组加链表（红黑树）的结构，首先调用对象的hashCode方法落桶，然后在冲突的情况下进行遍历，用equals方法去重。

## 一、什么是布隆过滤器

布隆过滤器（Bloom Filter）的用处与HashSet类似，都是可以用来检索一个元素是否在一个集合中存在。