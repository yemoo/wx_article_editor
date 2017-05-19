const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const config = require('./config');

// ============ 配置部分 START ============
// 文章根目录
var ARTICLE_SRC = config.ARTICLE_SRC;
if (typeof ARTICLE_SRC == 'function') {
    ARTICLE_SRC = ARTICLE_SRC();
}
// 文章保存路径
const ARTICLE_DIST = config.ARTICLE_DIST;

// 插入到页面的代码
var INJECT_CODE = `
<!-- START EDITOR INJECT CODE -->
<link rel="stylesheet" href="/fontello/css/fontello.css">
<link rel="stylesheet" href="/sweetalert.css">
<link rel="stylesheet" href="/editor.css?{ts}">
<script src="/exif.js"></script>
<script src="/sweetalert.min.js"></script>
<script src="/editor.js?{ts}"></script>
<!-- END EDITOR INJECT CODE -->`;
// ============ 配置部分 END ============


// 静态资源
const STATIC_PATH = __dirname + "/public";
// node服务端口
const PORT = process.env.PORT || 3000;
// const ENV = process.evn.NODE_ENV || 'development';

function crc32(pathname) {
    var n = function () {
            for (var e = 0, t = new Array(256),
                     n = 0; 256 != n; ++n) e = n, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, t[n] = e;
            return "undefined" != typeof Int32Array ? new Int32Array(t) : t
        }(),
        r = function (e) {
            for (var t, r, i = -1, o = 0,
                     a = e.length; o < a;) t = e.charCodeAt(o++), t < 128 ? i = i >>> 8 ^ n[255 & (i ^ t)] : t < 2048 ? (i = i >>> 8 ^ n[255 & (i ^ (192 | t >> 6 & 31))], i = i >>> 8 ^ n[255 & (i ^ (128 | 63 & t))]) : t >= 55296 && t < 57344 ? (t = (1023 & t) + 64, r = 1023 & e.charCodeAt(o++), i = i >>> 8 ^ n[255 & (i ^ (240 | t >> 8 & 7))], i = i >>> 8 ^ n[255 & (i ^ (128 | t >> 2 & 63))], i = i >>> 8 ^ n[255 & (i ^ (128 | r >> 6 & 15 | (3 & t) << 4))], i = i >>> 8 ^ n[255 & (i ^ (128 | 63 & r))]) : (i = i >>> 8 ^ n[255 & (i ^ (224 | t >> 12 & 15))], i = i >>> 8 ^ n[255 & (i ^ (128 | t >> 6 & 63))], i = i >>> 8 ^ n[255 & (i ^ (128 | 63 & t))]);
            return i ^ -1
        },
        i = pathname + "?r=" + Math.random().toString(10).substring(2);
    var o = r(i) >>> 0;
    return i + "&s=" + o;
}

app.use(bodyParser.json({limit: '5mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'})); // for parsing application/x-www-form-urlencoded

// const phantom = require('phantom');
// var page = phantom.create()
//     .then(instance => instance.createPage());
//
// app.get('/fetch', (req, res, next) => {
//     page.then(page => {
//             // page.on("onResourceRequested", function(requestData) {
//             //     console.info('Requesting', requestData.url)
//             // });
//             page.open('http://open.toutiao.com/i6410909440475660802/?utm_campaign=open&utm_medium=webview&utm_source=caijingluntan_wap_1')
//                 .then(() => page.property('content'))
//                 .then(content => console.log(content));
//         })
//
//     res.send('ok');
// });

// 文章内容捕获
app.get(/^\/articles\/(.+?\.html)$/, (req, res, next) => {
    var file = req.params[0];
    if (!file) {
        res.status(404).end('Page not Found!');
    }

    // file = file.replace(/\.\.\/?/g, '');
    var src = path.join(ARTICLE_SRC, file);
    if (file.indexOf('____.html') > -1) {
        return fs.readdir(ARTICLE_SRC + (req.query.p || ''), (err, files) => res.send(files));
    }
    if (!fs.existsSync(src)) {
        return next();
    }

    fs.readFile(src, (err, content) => {
        if (err) {
            return res.status(500).end(err.toString());
        }

        var injectCode = INJECT_CODE.replace(/\{ts\}/g, Date.now());
        if (content.toString().indexOf('�') != -1) {
            content = iconv.decode(content, 'GBK');
            content = iconv.encode(content, 'UTF8');
            injectCode += '<!-- ENCODE:GBK -->';
        }

        // injectCode = '';

        var isInject = false;
        content = content.toString().replace(/<\/body>/i, function (o) {
            isInject = true;
            return injectCode + o;
        });

        if (!isInject) {
            content += injectCode + '</body></html>';
        }

        res.send(content);
    });
});

// 图片上传
app.post('/upload', function (req, res) {
    //接收前台POST过来的base64
    var imgData = req.body.data || '';
    var refer = req.body.refer || '';

    if (!imgData || !refer) {
        return res.json({
            code: -1,
            msg: '参数错误'
        });
    }

    var imgDir = path.dirname(refer).replace(/^\/articles/, '');

    //过滤data:URL
    var fileType = 'png';
    var base64Data = imgData.replace(/^data:image\/(\w+);base64,/, function (o, ext) {
        fileType = ext;
        return '';
    });
    var fileName = Date.now() + ('' + Math.random()).substr(1) + '.' + fileType;
    fs.writeFile(path.join(ARTICLE_SRC, imgDir, fileName), new Buffer(base64Data, 'base64'), function (err) {
        if (err) {
            res.json({
                code: -1,
                msg: '上传失败'
            });
        } else {
            res.json({
                code: 0,
                msg: fileName
            });
        }
    });
});

// 保存数据
app.post('/save', function (req, res) {
    var content = req.body.content;
    var title = req.body.title;
    // 防止重写父目录
    var page = req.body.page;
    // .replace(/\.\.\/?/g, '');

    if (content && page) {
        var src = path.join(ARTICLE_SRC, page.replace(/^\/articles/, ''));
        if (!fs.existsSync(src)) {
            return res.send({
                code: -1,
                msg: '原始文件不存在'
            });
        }

        fs.readFile(src, (err, html) => {
            if (err) {
                return res.status(500).end(err.toString());
            }

            var gbk = html.toString().indexOf('�') != -1;
            if (gbk) {
                html = iconv.decode(html, 'GBK');
                html = iconv.encode(html, 'UTF8');
            }

            var $ = cheerio.load(html.toString());
            $('.n_title').html(title);
            $('.n_content').html(content);
            html = $.html();

            if (gbk) {
                // 按原编码保存
                html = iconv.encode(html, 'GBK');
            }

            var articleDist = ARTICLE_DIST;
            if (typeof ARTICLE_DIST == 'function') {
                articleDist = ARTICLE_DIST(src);
            }
            fs.writeFile(articleDist, html, function () {
                res.json({
                    code: 0,
                    msg: 'ok'
                });
            });
        });
    } else {
        res.json({
            code: -1,
            msg: '参数缺失'
        });
    }
});

function getTudouVideo(vid, res){
    var videoUrl = 'https://ups.youku.com/ups/get.json?vid=' + vid + '&ccode=0505&client_ip=0.0.0.0&client_ts=1491234773&utid=ACXYEMfZ%20UACAXT3bTq%20Rp%2Fq';
    fetch(videoUrl).then(res => res.json()).then(json => res.redirect(json.data.stream[0].m3u8_url)).catch(err => res.send(err.toString()));
}

function getTudouPoster(vid, res){
    var videoUrl = 'https://ups.youku.com/ups/get.json?vid=' + vid + '&ccode=0505&client_ip=0.0.0.0&client_ts=1491234773&utid=ACXYEMfZ%20UACAXT3bTq%20Rp%2Fq';
    fetch(videoUrl).then(res => res.json()).then(json => res.redirect(json.data.video.logo)).catch(err => res.send(err.toString()));
}

// 土豆地址跳转
app.get('/tudou-video-url', function (req, res) {
    if(/\d{9}/.test(req.query.vid)){
        return fetch('http://video.tudou.com/v/' + req.query.vid).then(res => res.text())
            .then(text => /viden: "([\w=]+==)"/.test(text) && getTudouVideo(RegExp.$1, res));
    }

    return getTudouVideo(req.query.vid, res);

});
app.get('/tudou-video-poster', function (req, res) {
    if(/\d{9}/.test(req.query.vid)){
        return fetch('http://video.tudou.com/v/' + req.query.vid).then(res => res.text())
            .then(text => /viden: "([\w=]+==)"/.test(text) && getTudouPoster(RegExp.$1, res));
    }

    return getTudouPoster(req.query.vid, res);
});

// 今日头条视频
const TOUTIAO_OPTS = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
};
app.get('/toutiao-video-url', function (req, resp) {
    var originUrl = req.query.url;

    var headers = req.headers;
    delete headers.referer;
    delete headers.host;

    fetch(originUrl, TOUTIAO_OPTS).then(res => res.text())
        .then(text => {
            if (/item_id = "(\d+)"/.test(text)) {
                return fetch('https://m.365yg.com/i' + RegExp.$1 + "/info/");
            }
            throw new Error('无法解析');
        })
        .then(res => res.json())
        .then(json => {
            var content = json.data.content;
            var videoId = /tt-videoid='([^']+)'/.test(content) && RegExp.$1;
            return fetch('http://i.snssdk.com' + crc32('/video/urls/v/1/toutiao/mp4/' + videoId));
        })
        .then(res => res.json())
        .then(json => new Buffer(json.data.video_list.video_1.main_url, 'base64').toString())
        .then(videoUrl => request({
            url: videoUrl,
            headers: headers    // 使用浏览器自身发起的 range header，否则在手机上视频无法加载
        }).pipe(resp))
        .catch(err => resp.send(err.toString()));
});
// 今日头条视频封面
app.get('/toutiao-video-poster', function (request, response) {
    var originUrl = request.query.url;

    fetch(originUrl, TOUTIAO_OPTS).then(res => res.text())
        .then(text => {
            if (/share_url:'http:\/\/www\.toutiao\.com\/item\/(\d+)\/'/.test(text) || /item_id = "(\d+)"/.test(text)) {
                return fetch('https://m.365yg.com/i' + RegExp.$1 + "/info/");
            }
            throw new Error('无法解析');
        })
        .then(res => res.json())
        .then(json => {
            var content = json.data.content;
            var posterURL = /tt-poster='([^']+)'/.test(content) && RegExp.$1;
            return fetch(posterURL);
        })
        .then(res => res.body.pipe(response))
        .catch(err => response.send(''));
});

app.use('/articles', express.static(ARTICLE_SRC));
app.use(express.static(STATIC_PATH));
// 其他请求代理到原服务器
app.all('*', function (req, res, next) {
    var options = {
        method: req.method,
        url: 'http://123.56.118.226:8088/share-core' + req.params[0],
        qs: req.query,
        json: true,
        body: req.body,
        headers: req.headers
    };
    request(options, function (error, response, body) {
        if (error) {
            return next(error);
        }
        res.set(response.headers);
        res.send(body);
    })
});


app.listen(PORT, function () {
    console.log('Example app listening on port ' + PORT + '!')
});