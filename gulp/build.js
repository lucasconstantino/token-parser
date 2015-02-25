/**
 * Build related tasks.
 */

var gulp        = require('gulp')
  , browserify  = require('browserify')
  , transform   = require('vinyl-transform')
  , rename      = require('gulp-rename')
  , pack        = require('../package.json');

/**
 * Unit test: uses Mocha to test TokenParser.
 */
gulp.task('build', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename, {
      standalone: 'TokenParser'
    });
    return b.bundle();
  });

  return gulp.src(['./index.js'])
    .pipe(browserified)
    .pipe(rename(pack.name + '.js'))
    .pipe(gulp.dest('./dist'));
});

