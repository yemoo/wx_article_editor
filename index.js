var express = require('express');
var app = express();
var fetch = require('node-fetch');

var staticPath = __dirname + "/public";

var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
// var upload = multer({dest: staticPath + '/upload/'});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

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

const ONLINE = false;

// demo page
app.get('/', (req, res) => res.redirect(ONLINE ? 'demo_online.html' : 'demo.html'));

if(ONLINE) {
    app.get('/demo.html', (req, res) => res.redirect('demo_online.html'));
    app.get('/editor.js', (req, res) => res.redirect('editor.min.js'));
    app.get('/editor.css', (req, res) => res.redirect('editor.min.css'));
}

// 今日头条视频
app.get('/toutiao-video-url', function (request, response) {
    var originUrl = request.query.url;
    fetch(originUrl).then(res => res.text())
        .then(text => {
            if (/videoid:'(\w+)'/.test(text)) {
                return 'http://i.snssdk.com' + crc32('/video/urls/v/1/toutiao/mp4/' + RegExp.$1);
            }
            throw new Error('无法解析');
        })
        .then(url => fetch(url))
        .then(res => res.json())
        .then(json => {
            var videoUrl = json.data.video_list.video_1.main_url;
            return new Buffer(videoUrl, 'base64').toString();
        })
        .then(videoUrl => fetch(videoUrl))
        .then(res => res.body.pipe(response))
        .catch(err => response.send(err.toString()));
});

// 保存数据
app.post('/save', function (req, res) {
    res.send(req.body);
});

app.use(express.static(staticPath));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});