/**
 * Main gulp file.
 */

// Load all tasks.
require('require-dir')('./gulp');

// Register default.
require('gulp').task('default', ['test']);
