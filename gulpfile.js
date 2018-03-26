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
let buildGame = [
  {
    mainFile: 'saveTheWorld/heroSelect.ts',
    requiredFiles: ['src/exports/*.ts', 'src/saveTheWorld/required/*.ts'],
    exportTo: '../phaser/'
  },
  {
    mainFile: 'saveTheWorld/level1.ts',
    requiredFiles: ['src/exports/*.ts', 'src/saveTheWorld/required/*.ts'],
    exportTo: '../phaser/'
  },
]



gulp.task('default', function () {
  var queue = sequence(1);  // SMALL DELAY SO CLEARHTML DOESN'T BREAK
  watch('src/**/*.ts', {
    emitOnGlob: false
  }, queue.getHandler('build'));
});



gulp.task('build', () => {
  buildGame.map(obj => {
    gulp.src([`src/${obj.mainFile}`, ...obj.requiredFiles])
      .pipe(removeCode({ gameBuild: true }))
      .pipe(concat(`${obj.mainFile}`))
      .pipe(replace('export class', 'class'))
      .pipe(ts({
        target: "es5",
        module: "system",
        declaration: false,
        noImplicitAny: false,
        removeComments: true,
        noLib: false
      }))
      .pipe(gulp.dest(obj.exportTo || 'build'))
      .pipe(minify({
        ext:{
            min:'.min.js'
        },
      }))
      .pipe(gulp.dest(obj.exportTo || 'build'))
      .pipe(notify({message: `${obj.mainFile} task has been completed.`, onLast: true}));
  })

});
