 //引入node模块，一会要操作文件，输入，生成，输出都需要这玩意。
const path = require('path');
const{ writeFile } = require("fs");
// 主角，必须引入。要不然咋用
const SpritesmithPlugin = require('webpack-spritesmith');
// vue-loader
const VueLoaderPlugin = require('vue-loader/lib/plugin');
// copy插件，把一个文件或目录拷贝到另一个地方,这里用来拷贝index.html
// https://www.npmjs.com/package/copy-webpack-plugin
const CopyWebpackPlugin = require('copy-webpack-plugin');


/* 
这里我们可以自己修改生成的模板样式，默认 webpack，会根据你的target里的配置，自动生成一个sprite.(c|le|sc)ss的样式文件
如果自动生成的不满意，
我们可以在这里修改，
可以自己打印一下 data里面的参数，看着就会大概明白（先看下面的配置，最后看这个模板）
这个文档也稍微有点用，放上来
https://github.com/qq20004604/webpack-study/tree/master/8%E3%80%81%E6%8F%92%E4%BB%B6/webpack-spritesmith
*/
const customSpritesFunction = function (data) {
	// 观察data 到底是个啥
	// console.log(data);
	writeFile("./data.json",JSON.stringify(data),function(err){
		if(!err){
			console.log("写入成功！");
		}
	});
	// 观察data发现是个对象其中属性items和属性sprites都是数组，而且内容相同，截取其数组第一个数据
	// 可以看到items和属性sprites里面存储的是图片的信息。宽高大小路径等各种参数
	/*{
		"x": 0,
		"y": 0,
		"width": 120,
		"height": 120,
		"name": "img_1x",
		"source_image": "/Users/lixinwei/Desktop/webpack-spritesmith-test/img/sprites/img_1x.png",
		"image": "~sprite.png",
		"escaped_image": "~sprite.png",
		"total_width": 260,
		"total_height": 260,
		"offset_x": 0,
		"offset_y": 0,
		"px": {
			"x": "0px",
			"y": "0px",
			"offset_x": "0px",
			"offset_y": "0px",
			"height": "120px",
			"width": "120px",
			"total_height": "260px",
			"total_width": "260px"
		}
	},
	*/

	// data.sprites数组图片信息，根据图片信息自己把一些属性组合到对应图片的类名里面，
	return data.sprites.map(function (sprite) {
		return '.icon-NAME-box{\n\tdisplay: inline-block;\n\toverflow: hidden;\n\twidth: BOXWIDTHpx;\n\theight: BOXHEIGHTpx;\n}\n.icon-NAME{\n\tdisplay: inline-block;\n\twidth: WIDTHpx;\n\theight: HEIGHTpx;\n\tbackground-image: url(IMG);\n\tbackground-position: Xpx Ypx;\n\ttransform-origin: 0 0;\n\ttransform: scale(NUM);\n}'
			.replace(/IMG/g,sprite.image)
			.replace(/NAME/g, sprite.name)
			.replace(/WIDTH/g, sprite.width)
			.replace(/HEIGHT/g, sprite.height)
			.replace(/X/g, sprite.offset_x)
			.replace(/Y/g, sprite.offset_y)
			.replace(/BOXHEIGHT/g, sprite.name.indexOf('_2x') > -1 ? sprite.height / 2 : sprite.height)
			.replace(/BOXWIDTH/g, sprite.name.indexOf('_2x') > -1 ? sprite.width / 2 : sprite.width)
			.replace(/NUM/g, sprite.name.indexOf('_2x') > -1 ? 0.5 : 1);
	}).join('\n');
	// 最后三行replace就是根据图片名是否决定进行缩放
};

// 所有的配置都在这个导出里面
module.exports = {
	mode: "development",
	//配置入口文件
	entry: "./js/main.js",
	//配置产出文件
	output: {
		//产出文件文件夹
		path: path.resolve(__dirname, "dist"),
		//产出文件的文件名
		filename: "bundle.js"
	},
	//实时监测文件更新，一旦文件更新了，就重新合并打包一份
	watch: true,
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.(c|le)ss$/, use: [
					'style-loader',
					'css-loader',
					'less-loader'
				]
			},
			{
				test: /\.png$/, use: [
					'file-loader?name=[hash].[ext]'
				]
			}
		]
	},
	resolve: {
		/*
		细节坑。文档里面写着 需要resolve，引入图片生成的位置，
		不加这行会报错。因为github，Readme里面有这句话
		resolve contains location of where generated image is
		（要把生成的地址resolve到modules里面。不写就错）
		一定要加，血的教训啊
		*/
		modules: ["node_modules", "./img"],
		extensions: [".js", ".json", ".jsx", ".css",".vue"]
	},
	stats: 'errors-only',
	// 定义一个插件数组。用来覆盖，在里面使用我们的主角
	plugins: [
		new SpritesmithPlugin({
			/*
			目标小图标，这里就是你需要整合的小图片的老巢。
			现在是一个个的散兵，把他们位置找到，合成一个
			*/
			src: {
				cwd: path.resolve(__dirname, './img/sprites'),
				glob: '*.png'
			},
			// 输出雪碧图文件及样式文件，这个是打包后，自动生成的雪碧图和样式，自己配置想生成去哪里就去哪里
			target: {
				image: path.resolve(__dirname, './img/sprite.png'),
				css: [
					// webpack，会自动生成一个sprite.css的样式
					[path.resolve(__dirname, './img/sprite.less'),{
						// 引用自己的模板
						format: 'custom_sprites_template'
					}]
				]
			},
			// 自定义模板入口，我们需要基本的修改webapck生成的样式，上面的大函数就是我们修改的模板
			customTemplates: {
				'custom_sprites_template': customSpritesFunction
			},
			// 生成的图片在 API 中被引用的路径。
			//简单来说，就是你上面输出了 image 和 css ，那么在 css 用什么样的路径书写方式来引用 image 图片（可以是别名，或相对路径）
			// 不写就是全局的绝对图片路径
			apiOptions: {
				cssImageRef: '~sprite.png'
			},
			// 让合成的每个图片有一定的距离，否则就会紧挨着，不好使用
			spritesmithOptions: {
				padding: 20
			}
		}),
		new VueLoaderPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{ from: __dirname + "/index.html", to:  __dirname + "/dist" }
			],
		
		})
	]
}