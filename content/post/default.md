+++
date = 2020-11-07T16:00:00Z
draft = true
title = "Java的匿名类、Lambda、匿名接口类与方法引用"
url = "/post/java"

+++
### 一、前言

从我接触Java伊始，就接触了很多匿名函数，最典型的是Java的多线程，写法如下：

            new Thread(() -> {
                for (int i = 0; i < 100; i++) {
                    System.out.println(i);
                }
            }).start();

起初我十分不理解这是一种什么写法，经过查询也只知道这是一种叫Lambda函数的东西，看了很多文章之后也没能很好的理解。现在是终于搞懂了，所以写一篇总结来帮助我梳理一下相关知识。

### 二、匿名类与匿名函数

匿名类，顾名思义就是没有类名字的类。匿名函数相对应的就是没有名字的函数。因为没有名字，两者都适用于定义一个不需要被重用的类或者方法的场景。其实这两者是共通的。在我的理解里，匿名函数是对匿名内部类的进一步简化抽象。对于匿名类来说，一般都是需要实现多个方法时使用的。例子如下：

    interface Pet {
        String getName();
        String getAge();
    }
    
    class PetShop {
        static void sell (Pet pet) {
            System.out.println("Pet name is " + pet.getName()
                    + "\nPet age is " + pet.getAge());
        }
    
        public static void main(String[] args) {
            PetShop.sell(new Pet() {
                @Override
                public String getName() {
                    return "Ruby";
                }
    
                @Override
                public String getAge() {
                    return "10";
                }
            });
        }
    }

可以看到，在这个例子中，PetShop这个类的sell方法会用到Pet接口的实现类，但是这个实现类只需要使用一次，不需要复用（因为这里面逻辑是出售）。在这种情况下就可以使用匿名类，在不定义类名的情况下实现两个方法即可。

但是在只需要实现接口一个方法的情况下，我们可以简化上面的使用方式，适用匿名函数，也就是Lambda表达式：

    interface Pet {
        String getName();
    }
    
    class PetShop {
        static void sell (Pet pet) {
            System.out.println("Pet name is " + pet.getName());
        }
    
        public static void main(String[] args) {
            PetShop.sell(() -> "Ruby");
        }
    }

一下子少了很多行代码，Lambda表达式分为两部分，用->分开，左边是方法的参数，右边是返回值。相比匿名类的实现方式，删除了接口信息和方法名。其实仔细想想就知道为什么这些东西都能删掉。接口信息在sell方法中有定义，方法调用也有，并且由于只有一种方法需要实现，所以根本不需要纠结，只需要把Lambda右边的返回值赋值给pet.getName()就好了。

，用Comparator接口举个例子

            class ComparatorImpl implements Comparator<Integer> {
                @Override
                public int compare(Integer o1, Integer o2) {
                    return o1.compareTo(o2);
                }
            }
            List<Integer> integers = new ArrayList<>(Arrays.asList(5, 4, 3, 2, 1, 0));
            Comparator<Integer> comparator0 = new ComparatorImpl();
            Comparator<Integer> comparator1 = new Comparator<Integer>() {
                @Override
                public int compare(Integer o1, Integer o2) {
                    return o1.compareTo(o2);
                }
            };
    //        Comparator<Integer> comparator2 = (o1, o2) -> o1 > o2 ? 1 : 0;
            integers.sort(comparator0);
            System.out.println(integers);
    //        integers.sort(comparator2);