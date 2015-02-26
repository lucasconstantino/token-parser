/**
 * Build related tasks.
 */

var gulp        = require('gulp')
  , browserify  = require('browserify')
  , uglify      = require('gulp-uglify')
  , transform   = require('vinyl-transform')
  , concat      = require('gulp-concat')
  , uglify      = require('gulp-uglify')
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
    .pipe(concat(pack.name + '.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(uglify({
      mangle: false
    }))
    .pipe(concat(pack.name + '.min.js'))
    .pipe(gulp.dest('./dist'));
});

