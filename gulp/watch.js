/**
 * Test related tasks.
 */

var gulp  = require('gulp');

/**
 * Unit test watcher: run mocha tests on every file change.
 */
gulp.task('test:watch:unit', function () {
  gulp.watch(['lib/**', 'test/**', 'index.js'], ['test:unit']);
});

gulp.task('test:watch', ['test:watch:unit']);
gulp.task('watch', ['test:watch']);