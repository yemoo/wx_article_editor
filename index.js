const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const request = require('request');
const Iconv = require('iconv').Iconv;

// ============ 配置部分 START ============
// 文章根目录
const ARTICLE_DIR = path.resolve('./articles');
// 文章保存路径
function saveDist(src){
    return src.replace(/\.html$/, '.html');
}
// 插入到页面的代码
var INJECT_CODE = `
<!-- START EDITOR INJECT CODE -->
<link rel="stylesheet" href="/fontello/css/fontello.css">
<link rel="stylesheet" href="/editor.css">
<script src="/exif.js"></script>
<script src="/editor.js"></script>
<!-- END EDITOR INJECT CODE -->`;
// ============ 配置部分 END ============


// 静态资源
const STATIC_PATH = __dirname + "/public";
// node服务端口
const PORT = process.env.PORT || 3000;
// const ENV = process.evn.NODE_ENV || 'development';

function crc32(pathname) {
    var n = function () {
            for (var e = 0, t = new Array(256), n = 0; 256 != n; ++n) e = n, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1, t[n] = e;
            return "undefined" != typeof Int32Array ? new Int32Array(t) : t
        }(),
        r = function (e) {
            for (var t, r, i = -1, o = 0, a = e.length; o < a;) t = e.charCodeAt(o++), t < 128 ? i = i >>> 8 ^ n[255 & (i ^ t)] : t < 2048 ? (i = i >>> 8 ^ n[255 & (i ^ (192 | t >> 6 & 31))], i = i >>> 8 ^ n[255 & (i ^ (128 | 63 & t))]) : t >= 55296 && t < 57344 ? (t = (1023 & t) + 64, r = 1023 & e.charCodeAt(o++), i = i >>> 8 ^ n[255 & (i ^ (240 | t >> 8 & 7))], i = i >>> 8 ^ n[255 & (i ^ (128 | t >> 2 & 63))], i = i >>> 8 ^ n[255 & (i ^ (128 | r >> 6 & 15 | (3 & t) << 4))], i = i >>> 8 ^ n[255 & (i ^ (128 | 63 & r))]) : (i = i >>> 8 ^ n[255 & (i ^ (224 | t >> 12 & 15))], i = i >>> 8 ^ n[255 & (i ^ (128 | t >> 6 & 63))], i = i >>> 8 ^ n[255 & (i ^ (128 | 63 & t))]);
            return i ^ -1
        },
        i = pathname + "?r=" + Math.random().toString(10).substring(2);
    var o = r(i) >>> 0;
    return i + "&s=" + o;
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// 文章内容捕获
app.get(/^\/articles\/(.+?\.html)$/, (req, res, next) => {
    var file = req.params[0];
    if (!file) {
        res.status(404).end('Page not Found!');
    }

    var src = path.join(ARTICLE_DIR, file);
    if (!fs.existsSync(src)) {
        return next();
    }

    fs.readFile(src, (err, content) => {
        if(err) {
            return res.status(500).end(err.toString());
        }

        if(content.toString().indexOf('�') != -1){
            content = new Iconv('GBK', 'UTF8').convert(content);
        }

        var isInject = false;
        content = content.toString().replace(/<\/body>/i, function(o){
            isInject = true;
            return INJECT_CODE + o;
        });
        if(!isInject){
            content += INJECT_CODE;
        }

        res.send(content);
    });
});

// 保存数据
app.post('/save', function (req, res) {
    var content = req.body.data;
    var page = req.body.page;
    if(content && page){
        content = content.replace(INJECT_CODE, '');

        page = path.join(ARTICLE_DIR, page.replace(/^\/articles/, ''));
        page = saveDist(page);

        fs.writeFile(page, content, function(){
            res.json({
                code: 0,
                msg: 'ok'
            });
        });
    } else{
        res.json({
            code: -1,
            msg: '参数缺失'
        });
    }
});

// 土豆地址跳转
app.get('/tudou-video-url', function (req, res) {
    var videoUrl = 'https://ups.youku.com/ups/get.json?vid=' + req.query.vid + '&ccode=0505&client_ip=0.0.0.0&client_ts=1491234773&utid=ACXYEMfZ%20UACAXT3bTq%20Rp%2Fq';
    fetch(videoUrl).then(res => res.json())
        .then(json => res.redirect(json.data.stream[0].segs[0].cdn_url))
        .catch(err => res.send(err.toString()));
});
app.get('/tudou-video-poster', function (req, res) {
    var videoUrl = 'https://ups.youku.com/ups/get.json?vid=' + req.query.vid + '&ccode=0505&client_ip=0.0.0.0&client_ts=1491234773&utid=ACXYEMfZ%20UACAXT3bTq%20Rp%2Fq';
    fetch(videoUrl).then(res => res.json())
        .then(json => res.redirect(json.data.video.logo))
        .catch(err => res.send(err.toString()));
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

app.use('/articles', express.static(ARTICLE_DIR));
app.use(express.static(STATIC_PATH));

app.listen(PORT, function () {
    console.log('Example app listening on port ' + PORT + '!')
});