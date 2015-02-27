/**
 * Test related tasks.
 */

var gulp      = require('gulp')
  , gutil     = require('gulp-util')
  , mocha     = require('gulp-mocha')
  , benchmark = require('gulp-bench');

/**
 * Unit test: uses Mocha to test TokenParser.
 */
gulp.task('test:unit', function () {
  return gulp.src(['test/unit/**/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list' }))
    .on('error', gutil.log);
});

/**
 * Performance test.
 */
gulp.task('test:performance', function () {
  return gulp.src(['test/performance/**/*.js'])
    .pipe(benchmark());
});

gulp.task('test', ['test:unit', 'test:performance']);
