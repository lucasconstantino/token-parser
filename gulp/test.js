/**
 * Test related tasks.
 */

var gulp  = require('gulp')
  , gutil = require('gulp-util')
  , mocha = require('gulp-mocha');

/**
 * Unit test: uses Mocha to test TokenParser.
 */
gulp.task('test:unit', function () {
  return gulp.src(['test/**/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list' }))
    .on('error', gutil.log);
});

/**
 * Unit test watcher: run mocha tests on every file change.
 */
gulp.task('test:watch:unit', function () {
  gulp.watch(['lib/**', 'test/**', 'index.js'], ['test:unit']);
});

gulp.task('test', ['test:unit']);
gulp.task('test:watch', ['test:watch:unit']);
