const gulp = require('gulp');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const through = require('through2');
const packer = require('packer');
const gulpIf = require('gulp-if');
const babel = require('gulp-babel');

const jsMinify = uglify({
    output: {
        // 避免对'\uxxxx'的反转，强制将所有unicode转为ascii
        ascii_only: true
    },
    compress: {
        // unsafe: true
    }
});

gulp.task('minifyNode', function () {
    return gulp.src('index.jsx')
        .pipe(babel({
            "minified": true,
            "comments": false,
            "presets": [["es2015", {loose: true}]]
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('minifyAssets', function () {
    return gulp.src(['public/editor.js', 'public/editor.css'])
        .pipe(gulpIf(/\.js$/, jsMinify))
        .pipe(gulpIf(/\.js$/, through.obj(function (file, enc, cb) {
            var contents = file.contents.toString();
            file.contents = new Buffer(packer.pack(contents, true, true));
            cb(null, file);
        })))
        .pipe(gulpIf(/\.css$/, cleanCss({})))
        .pipe(gulp.dest('public/dist'));
});

gulp.task('default', ['minifyNode', 'minifyAssets']);