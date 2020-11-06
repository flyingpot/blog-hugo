+++
date = ""
draft = true
title = "default"
url = ""

+++
Java的匿名函数、Lambda、匿名接口类与方法引用

### 一、前言

从我接触Java伊始，

  
\`\`\`Java

            class ComparatorImpl implements Comparator<Integer> {            @Override            public int compare(Integer o1, Integer o2) {                return o1.compareTo(o2);            }        }        List<Integer> integers = new ArrayList<>(Arrays.asList(5, 4, 3, 2, 1, 0));        Comparator<Integer> comparator0 = new ComparatorImpl();        Comparator<Integer> comparator1 = new Comparator<Integer>() {            @Override            public int compare(Integer o1, Integer o2) {                return o1.compareTo(o2);            }        };//        Comparator<Integer> comparator2 = (o1, o2) -> o1 > o2 ? 1 : 0;        integers.sort(comparator0);        System.out.println(integers);//        integers.sort(comparator2);

\`\`\`