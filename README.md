# wx_article_editor
> 微信文章二次编辑工具，支持文字，视频，图片等



## 脚本启动说明：

1. 首先需要服务器安装 [nodejs](https://nodejs.org/en/)，具体参看官网说明。
2. 进入程序目录，执行 `node app.js`。
3. 如果没有报错或者异常退出，服务就已经正常通过3000端口启动了。



## 代码说明：

1. 代码文件说明

   1. **config.js：**配置文件
   2. **gulpfile.js：**静态资源代码脚本
   3. **index.js：**nodejs 启动文件（主程序文件）
   4. **package.json：**nodejs 包文件（包含依赖模块，基本信息等）
   5. **public：**静态资源文件（JS、CSS、图片文件）
   6. **node_modules：**node 依赖的第三方模块

2. config.js 配置说明（

   > **示例说明：**
   >
   > 原始文章：http://www.fx235.top/share-core/wx/2017-06-13/c306488b-5a5d-4e1b-8dbe-74f413c5f378/b.html
   >
   > 目标文章：http://123.56.118.226:3000/articles/2017-06-03/c306488b-5a5d-4e1b-8dbe-74f413c5f378/b.html?edit&state=edit,

   1. **ORIGIN_ARTICLE_PATH：**原始文章的访问URL 前缀，如：http://www.fx235.top/share-core/wx
   2. **ARTICLE_SRC：**原文章目录（相对于当前程序目录的位置，如path.resolve('../share-core/wx')）
   3. **ARTICLE_DIST：**编辑后文章的保存路径，一般不需要修改（默认覆盖同名文件）
   4. **MAX_UPLOAD_PICS：**一篇文章最多允许上传图片数量。

3. gulp 文件打包说明：

   1. 首先需要全局安装 [gulp](https://gulpjs.com/)
   2. 代码修改（包含 index.jsx 和 public下的文件修改）后，在目录下执行 gulp 命令集成，代码会生成 index.js 文件和压缩后的 editor.css/editor.js（在 public/dist 下，可以复制到部署程序的目录）

4. index.js：主程序文件

   1. 搜索 **const STATIC_PATH**，可以修改静态资源路径，默认为 public
   2. 搜索 **const PORT**，可以修改默认端口号

5. node 程序依赖包说明（package.json 的 dependencies 部分）：

   1. **express/body-parser：**nodejs的web服务库
   2. **gulp*：**几个以 gulp 开头的文件都是打包脚本使用的库，用于代码 JS/CSS 压缩转换等
   3. **babel-preset-es2015：**JS 打包，转换 ES6->ES5 代码
   4. **through2：**打包依赖的库
   5. **cheerio：**服务端JS 解析 dom ，类似于浏览器上运行的 JQuery
   6. **iconv-lite：**文件内容编码转换，如 UTF8<—>GBK 等。
   7. **request/node-fetch：**服务端请求远程URL服务的库，用于读取土豆，头条等第三方数据。

6. public 目录：该目录下文件皆为浏览器端执行的文章编辑相关脚本/样式/图片等