// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var fs            = require('fs');
var templateCache = require('gulp-angular-templatecache');
var babel         = require('gulp-babel');
var concat        = require('gulp-concat');
var concatCss     = require('gulp-concat-css');
var header        = require('gulp-header');
var insert        = require('gulp-insert');
var jshint        = require('gulp-jshint');
var rename        = require('gulp-rename');
var sass          = require('gulp-sass');
var uglify        = require('gulp-uglify');

var addStream     = require('add-stream');

var projectName = 'explorerdownload';

var directories = {
   destination:  'dist',
	assets:       'dist',
	source:       'source',
	resources:    'resources',
   outresources: 'dist/resources'
};

// Lint Task
gulp.task('lint', function() {
    return gulp.src(directories.source + '/**/*.js')
        .pipe(jshint({esversion: 6}))
        .pipe(jshint.reporter('default'));
});

gulp.task('resources', function () {
    return gulp.src(directories.resources + '/**/*')
        .pipe(gulp.dest(directories.outresources));
});

gulp.task('views', function () {
    return gulp.src(directories.views + '/*')
        .pipe(gulp.dest(directories.destination));
});

//Concatenate & Minify JS
gulp.task('scripts', function() {
   return gulp.src(directories.source + '/**/*.js')
      .pipe(babel({
            presets: ['es2015']
      }))
	   .pipe(addStream.obj(prepareNamedTemplates(projectName)))
      .pipe(concat(projectName + '.js'))
      .pipe(header(fs.readFileSync(directories.source + '/licence.txt', 'utf8')))
      .pipe(gulp.dest(directories.assets));
});

gulp.task('squash', function() {
	return squashJs(projectName);
});

function squashJs(name) {
	return gulp.src(directories.assets + '/' + name + '.js')
		.pipe(uglify())
      .pipe(header(fs.readFileSync(directories.source + '/licence.txt', 'utf8')))
		.pipe(gulp.dest(directories.assets + "/min"));
}

// Watch Files For Changes
gulp.task('watch', function() {
	// We watch both JS and HTML files.
    gulp.watch(directories.source + '/**/*(*.js|*.html)', ['lint']);
    gulp.watch(directories.source + '/**/*(*.js|*.html)', ['scripts']);
    gulp.watch(directories.source + '/**/*.css', ['concatCss']);
    gulp.watch(directories.assets + '/**/*(*.js|*.css)', ['copyToOthers']);
    //gulp.watch('scss/*.scss', ['sass']);
});

gulp.task('concatCss', function () {
  return gulp.src(directories.source + '/**/*.css')
    .pipe(concatCss(projectName + ".css"))
    .pipe(gulp.dest(directories.assets));
});


gulp.task('copyToOthers', function() {
   // On Larry's machine he has it relative to a working project served by nodejs and can do updates on the fly.
   // This task can be set up to do running integration testing.

    //gulp.src(['dist/explorerdownload.js', 'dist/explorerdownload.css'])
    //    .pipe(gulp.dest('../explorer-testbed/dist/app/bower_components/explorer-download/dist'));

    //gulp.src(['dist/ga-explorer-map.js', 'dist/ga-explorer-map.min.js', 'ga-explorer-map.css'])
    //    .pipe(gulp.dest('../explorer-rock-properties/src/main/webapp/rock-properties/bower_components/ga-explorer-map-components/dist'))
});

gulp.task('package', function() {
   return gulp.src('package.json')
      .pipe(gulp.dest(directories.assets));
});

gulp.task('build', ['views', 'package', 'scripts', 'concatCss', 'resources'])

// Default Task
gulp.task('default', ['lint', 'scripts', 'concatCss', 'watch', 'resources']);

function prepareNamedTemplates(name) {
   return gulp.src(directories.source + '/' + name + '/**/*.html')
      .pipe(templateCache({module: name + ".templates", root:name, standalone : true}));
}