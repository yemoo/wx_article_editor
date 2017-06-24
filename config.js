const path = require('path');
module.exports = {
    ORIGIN_ARTICLE_PATH: '',
    ARTICLE_SRC: path.resolve('./articles'),
    ARTICLE_DIST: src => src.replace(/\.html$/, '.html'),
    MAX_UPLOAD_PICS: 3,
};