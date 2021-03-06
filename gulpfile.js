var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		bourbon        = require('node-bourbon'),
		ftp            = require('vinyl-ftp'),
		notify         = require("gulp-notify");

// Скрипты проекта
gulp.task('scripts', function() {
	return gulp.src([
		// 'app/libs/jquery/dist/jquery.min.js',
		// 'app/libs/az-select/az-select.js',
		// 'app/libs/bootstrap/bootstrap.min.js',
		// 'app/libs/owl.carousel/owl.carousel.min.js',
		// 'app/libs/mmenu/jquery.mmenu.min.all.js',
		// 'app/libs/superfish-master/dist/js/superfish.min.js',
		// 'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
		// 'app/libs/jquery.jcarousellite/jquery.jcarousellite.min.js',
		'app/js/common.js', // Всегда в конце
		'app/js/common2.js', // Всегда в конце
		])
	.pipe(concat('scripts.js'))
	// .pipe(uglify('scripts.min.js'))
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('min-scripts', function() {
	return gulp.src('app/js/scripts.js')
	.pipe(uglify())
	.pipe(rename('scripts.min.js'))
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		proxy: "gulp-php.loc",
		// server: {
		// 	baseDir: 'app'
		// },
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.scss')
	.pipe(sass({
		includePaths: bourbon.includePaths
	}).on("error", notify.onError()))
	.pipe(rename({suffix: '', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	// .pipe(cleanCSS())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('min-css', function() {
	return gulp.src('app/css/main.css')
	.pipe(rename("main.min.css"))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleanCSS())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'min-css', 'scripts', 'min-scripts', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.scss', ['sass']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js', 'app/js/common2.js'], ['scripts']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/**/*.php', browserSync.reload);
	gulp.watch('app/css/main.css', ['min-css']);
	gulp.watch('app/js/scripts.js', ['min-scripts']);
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/img')); 
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'scripts'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/main.min.css',
		]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));

});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
