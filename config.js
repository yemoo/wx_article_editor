const path = require('path');
module.exports = {
    ORIGIN_ARTICLE_PATH: 'http://123.56.118.226:8088/share-core/wx/',
    ARTICLE_SRC: path.resolve('./articles'),
    ARTICLE_DIST: src => src.replace(/\.html$/, '.html'),
    MAX_UPLOAD_PICS: 3,
};