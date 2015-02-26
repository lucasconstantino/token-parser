/**
 * Build related tasks.
 */

var fs          = require('fs')
  , gulp        = require('gulp')
  , browserify  = require('browserify')
  , uglify      = require('gulp-uglify')
  , transform   = require('vinyl-transform')
  , concat      = require('gulp-concat')
  , uglify      = require('gulp-uglify')
  , header      = require('gulp-header')
  , pkg         = require('../package.json')
  , signature   = fs.readFileSync('./signature');

/**
 * Get signature header.
 */
function signatureHeader() {
  return header(signature, {
    pkg: pkg
  });
}

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
    .pipe(concat(pkg.name + '.js'))
    .pipe(signatureHeader())
    .pipe(gulp.dest('./dist'))
    .pipe(uglify({
      mangle: false
    }))
    .pipe(signatureHeader())
    .pipe(concat(pkg.name + '.min.js'))
    .pipe(gulp.dest('./dist'));
});

