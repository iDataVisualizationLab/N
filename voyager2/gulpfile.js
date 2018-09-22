'use strict';

var gulp = require('gulp'),
bower = require('gulp-bower');

gulp.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e'
};

require('require-dir')('./gulp');

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir))
});