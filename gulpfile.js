const gulp = require('gulp'),
      ts = require('gulp-typescript'),
      removeCode = require('gulp-remove-code'),
      minify = require('gulp-minify'),
      watch = require('gulp-watch'),
      sequence = require('gulp-watch-sequence');
      concat = require('gulp-concat'),
      replace = require('gulp-replace'),
      notify = require('gulp-notify');

/* ALTER THIS WHEN BUILDING GAMES */
let buildGame = {
  mainFile: 'gameTemplate.ts',
  requiredFiles: ['src/exports/*.ts'],
  exportTo: '../phaser/boilerplate'
}


gulp.task('default', function () {
  var queue = sequence(1);  // SMALL DELAY SO CLEARHTML DOESN'T BREAK
  watch('src/**/*.ts', {
    emitOnGlob: false
  }, queue.getHandler('build'));
});



gulp.task('build', () => {
  return gulp.src([`src/${buildGame.mainFile}`, ...buildGame.requiredFiles])
    .pipe(removeCode({ gameBuild: true }))
    .pipe(concat(`${buildGame.mainFile}`))
    .pipe(replace('export class', 'class'))
    .pipe(ts({
      target: "es5",
      module: "system",
      declaration: false,
      noImplicitAny: false,
      removeComments: true,
      noLib: false
    }))
    .pipe(gulp.dest(buildGame.exportTo || 'build'))
    .pipe(minify({
      ext:{
          min:'.min.js'
      },
    }))
    .pipe(gulp.dest(buildGame.exportTo || 'build'))
    .pipe(notify({message: `${buildGame.mainFile} task has been completed.`, onLast: true}));
});
