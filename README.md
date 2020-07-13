### `webpack-spritesmith`使用教程

[简书-前端图片二三事](https://www.jianshu.com/p/99db6cf03abe)

### 启动项目

```
npm run dev
```
然后在浏览器打开 `dist` 目录下的 `index.html` 文件

### less 前置知识

`webpack-spritesmith` 编译的 CSS 就是简单类的使用，但是如果使用使用 `sass` 或 `less` 编译就会用到一些稀奇古怪的语法，为了能看懂 `less`  编译之后的文件，我们需要了解一下 `less` 的知识，推荐 [Less教程](https://www.w3cschool.cn/less/less_installation.html):

你也可以在线调试：https://lesstester.com/

- Less 的列表函数
列表函数函数一共两个方法：
    1. Length 列表的长度。
```
// 列表可以使用空格或逗号间隔
p{
  @list: "a", "b", "c", "d", "e", "f", "g", "h", "k", "m", "l", "s";
  @font-size: length(@list);
  font-size: @font-size * 1px;
}

p{
  @list: "a" "b" "c" "d" "e" "f" "g" "h" "k" "m" "l" "s";
  @font-size: length(@list);
  font-size: @font-size * 1px;
}
//上面两种写法等效，都会编译为：
p {
  font-size: 12px;
}
//less 很麻烦单位连接 * 1px

```
   2. Extract 返回列表中指定位置的值。

```
extract 就像访问数组一样，提取下标对应位置的值，不过 extract 的下标是从1开始的
p{
  @list: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17;
  @font-size: extract(@list,16);
  font-size: @font-size * 1px;
}
编译之后：
p {
  font-size: 16px;
}

上面是一维的列表，我们来看看二维列表：

p{
  @a: 1 2 3 4 5 6 7 8;
  @b: 9 10 11 12 13 14 15 16;
  @c : @a @b;
  font-size: extract(extract(@c,2),8) * 1px;
}
编译之后：
p {
  font-size: 16px;
}
p{
  @a: 1 2 3 4 5 6 7 8;
  @b: 9 10 11 12 13 14 15 16;
  @c : 17 18 19 20;
  @d: @a @b;
  @e: @c @d; 
  font-size: extract(extract(@c,2),8) * 1px;
}

还可以三维列表：
p{
  @a: 1 2 3 4 5 6 7 8;
  @b: 9 10 11 12 13 14 15 16;
  @c : 17 18 19 20;
  @d: @a @b;
  @e: @c @d; 
  font-size: extract(extract(extract(@e,2),2),1) * 1px;
}
编译之后：
p {
  font-size: 9px;
}

知道多维列表和单维列表，就能明白为什么经过`webpack-spritesmith`编译之后生成的`less`文件对只有一个精灵图是无效的。

改改循环，相应的我们可以写出来处理一张图片的 less 代码，但是没必要因为一张图完全可以直接引入
.sprites(@sprites, @i: 10) when (@i = length(@sprites)) {
	@sprite-name: e(extract(@sprites, length(@sprites)));
	.@{sprite-name} {
	  .sprite(@sprites);
	}
}
```

- Less 字符串函数

```
〜"some_text"中的任何内容将显示为 some_text 。
font-size: ~"12px";
编译之后：
font-size: 12px;

font-size: e("12px");
编译之后：
font-size: 12px;

〜"xxx" === e("xxx")

%此函数格式化一个字符串。 它可以写成以下格式:
font-size: e(%("12%d",px));
编译之后：
font-size: 12px;
```

