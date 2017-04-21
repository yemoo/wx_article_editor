const path = require('path');
module.exports = {
    ARTICLE_SRC: path.resolve('./articles'),
    ARTICLE_DIST: src => src.replace(/\.html$/, '.html')
};