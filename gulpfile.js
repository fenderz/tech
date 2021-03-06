const fs = require('fs');
const gulp = require('gulp');
const swig = require('gulp-swig');
const stylus = require('gulp-stylus');
const concat = require('gulp-concat');
const nodemon = require('gulp-nodemon');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-html-minifier');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');

const stylesPath = 'app/assets/styles/*.{styl,css}';
const scriptsPath = 'app/assets/scripts/*.js';
const imagePath = 'app/assets/images/**';
const templatesPath = './views/';

gulp.task('styles', function() {
    return gulp
        .src(stylesPath)
        .pipe(stylus({
            url: {
                name: 'url',
                limit: false
            }
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', '> 1%'],
            cascade: false
        }))
        .pipe(csso())
        .pipe(rename({suffix: '.bundle.min'}))
        .pipe(gulp.dest('./public/styles'))
});

gulp.task('scripts', function() {
    return gulp
        .src(scriptsPath)
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./public/scripts'));
});

gulp.task('imageMin', function() {
    return gulp.src(imagePath)
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [
                    { optimizationLevel: 3 },
                    { progessive: true },
                    { interlaced: true },
                    { removeViewBox: false },
                    { removeUselessStrokeAndFill: false },
                    { cleanupIDs: false }
                ]
            }),
            imagemin.gifsicle(),
            imagemin.jpegtran(),
            imagemin.optipng()
        ]))
        .pipe(gulp.dest('./public/img'))
});

gulp.task('htmlTemplates', ['styles', 'scripts'],  function() {
    return gulp
        .src(templatesPath + '*.html')
        .pipe(swig({defaults: { cache: false }}))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('watch', function () {
    gulp.watch('app/assets/**/*.{styl,css}', ['styles']);
    gulp.watch(scriptsPath, ['scripts']);
    gulp.watch(templatesPath + '*.html', ['htmlTemplates']);
});

gulp.task('startServer', function() {
    nodemon({
        script: 'server.js',
        ext: 'html js'
    })
    .on('restart', function() {
        console.log('restarted!')
    })
});

gulp.task('build', ['imageMin', 'styles', 'scripts', 'htmlTemplates']);

gulp.task('default', ['build', 'startServer', 'watch']);
