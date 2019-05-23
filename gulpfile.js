const gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var replace = require('gulp-replace');
var cssminify = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var include = require('gulp-html-tag-include');
var plumber = require('gulp-plumber');

//es6 minify
var uglifyjs = require('uglify-es');
var composer = require('gulp-uglify/composer');
var pump = require('pump');
var minify = composer(uglifyjs, console);

//react build use
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var named = require('vinyl-named');
var webpackConfig = require("./webpack.config.js");

//server load
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

//config
var config = {
	app: "app",
	temp: "tmp",
	dest: "dest",
	jsfolder: "/scripts"
};


//clean task
gulp.task('clean', function(){
	return del(['tmp', 'dest'], {force: true, read: false});
});

// Init BrowserSync.
gulp.task('browser-server', function(){
	browserSync.init({
		ui: {
			port: 3080
		},
		server: {
			baseDir: "./tmp",
			serveStaticOptions: {
				extensions: "html"
			}
		},
		port: 3000
	});

	return gulp.watch([
				config.app + '/{,*/}*.html',
				config.app + config.jsfolder + '/*.js',
				config.app + '/jsx/{*,*/,*/*/,*/*/*/, */*/*/*/}*.jsx',
				config.app + '/scss/{*,*/,*/*/,*/*/*/}*.scss'
			], gulp.parallel('RunTasks'));
});


//jsx task
gulp.task('react', function() {
	var _IsPRD = process.argv[2].toUpperCase();

	if (_IsPRD == "BUILD"){
		webpackConfig.watch = false;
	}

	return gulp.src([config.app + '/jsx/{*, */*, */*/}*.jsx', config.app + '/jsx/libraries/*.jsx'])
			.pipe(named())
			.pipe(plumber())
			.pipe(webpackStream(webpackConfig, webpack))
			.pipe(gulp.dest(config.temp + config.jsfolder))
			.pipe(browserSync.stream({ stream: true }));
});

//sass task
gulp.task('sass', function(){
	return gulp.src(config.app + '/scss/{*,*/,*/*/,*/*/*/}*.scss')
			.pipe(sass({
					includePaths: [
						'./node_modules/font-awesome',
						'./node_modules/compass-mixins/lib',
						'./node_modules/susy/sass',
						'./node_modules/animatewithsass/'
					],
					outputStyle: 'expanded',
					precision: 10,
					errLogToConsole: true
				}).on('error', sass.logError)
			)
			.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
			.pipe(gulp.dest(config.temp + '/css'))
			.pipe(browserSync.stream({ stream: true }));
});

//html template include task
gulp.task('html-include', function() {
	return gulp.src(config.app+'/*.html', {base: config.app})
		.pipe(include())
		.pipe(gulp.dest(config.temp))
		.pipe(browserSync.stream({ stream: true }));
});


//copy task
gulp.task('copy', function(){
	return gulp.src([
					config.app + config.jsfolder + '/*.js',
					config.app + '/fonts/*.*',
					config.app + '/images/{*,*/,*/*/}*.*',
					config.app + '/Themes/{*,*/,*/*/,*/*/*/}*.*',
					config.app + '/locales/*.js*'
				], { base: config.app })
			   .pipe(gulp.dest(config.temp))
			   .pipe(browserSync.stream({ stream: true }));
});

//dev tasks
gulp.task('RunTasks', gulp.parallel('react', 'html-include', 'sass', 'copy'));


//html replace text task
gulp.task('dist:replace', function() {
	return gulp.src(config.temp+'/*.html', {base: config.temp})
		.pipe(replace(/http:\/\/localhost:\d+/g, 'https://test-lifelab.skl.com.tw'))
		.pipe(gulp.dest(config.dest));
});

gulp.task('dist:css', function(){
	return gulp.src(config.temp + '/css/*.css', { base: config.temp })
			   .pipe(cssminify())
			   .pipe(gulp.dest(config.dest));
});

gulp.task('dist:copy', gulp.parallel('RunTasks', function () {
	return gulp.src([
					config.temp + config.jsfolder + '/*.js',
					config.temp + '/fonts/*.*',
					config.temp + '/images/{*,*/,*/*/}*.*',
				], { base: config.temp })
			   .pipe(gulp.dest(config.dest));
}));

gulp.task('dist:uglify', function(cb){
	pump([
		gulp.src([
			config.dest + config.jsfolder + '/*.js'
		], { base: config.dest }),
		minify({
			//do something settings
			//example: https://gist.github.com/gnux123/7ae8d479b47c7c9bb7b5ac533e197915
			toplevel: true,
			ie8: true
		}),
		gulp.dest(config.dest)
	],
	cb)
});

//prd tasks
gulp.task('PrdTasks', gulp.parallel('dist:css', 'dist:uglify', 'dist:replace'));

//develop environment
gulp.task('server', gulp.series('clean',
	gulp.parallel('browser-server','RunTasks')
));

//production environment
gulp.task('build', gulp.parallel('dist:copy', 'PrdTasks'));
