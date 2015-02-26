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
  return gulp.src(['test/unit/**/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list' }))
    .on('error', gutil.log);
});

gulp.task('test', ['test:unit']);
