// gulp
const gulp = require("gulp");
// server
const browserSync = require("browser-sync").create();
// special tools
const clean = require("gulp-clean");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
//html
const htmlmin = require("gulp-htmlmin");
const jade = require("gulp-jade");
//css
const csso = require("gulp-csso");
const autoprefixer = require("gulp-autoprefixer");
//images
const imagemin = require("gulp-imagemin");
//js
const uglify = require("gulp-uglify");
const browserify = require("gulp-browserify");

// gulp jsdoc - create documentation
const jsdoc = require("gulp-jsdoc3");
const size = require("gulp-filesize");
const uncss = require("gulp-uncss");
const dist = "./dist";
const modernizr = require("gulp-modernizr");
const plato = require("gulp-plato");
const complexity = require("gulp-complexity");
var fixmyjs = require("gulp-fixmyjs");
gulp.task("jade", async () => {
    gulp.src("./app/*.jade")
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>"),
            })
        )
        .pipe(jade({ pretty: true }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("./dist"));
});

gulp.task("css", async () => {
    gulp.src("./app/css/*.css")
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>"),
            })
        )
        .pipe(
            uncss({
                html: "./app/index.html",
            })
        )
        .pipe(concat("main.mini.css"))

        .pipe(
            autoprefixer({
                cascade: false,
            })
        )

        .pipe(csso())
        .pipe(size())
        .pipe(gulp.dest(dist));
});

gulp.task("js", async () => {
    gulp.src("./app/js/*.js")
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>"),
            })
        )
        .pipe(
            fixmyjs({
                // JSHint settings here
            })
        )
        .pipe(browserify({ insertGlobals: true, debug: true }))
        //.pipe(uglify())
        .pipe(rename("main.mini.js"))
        .pipe(gulp.dest("./dist"))
        .pipe(size());
});
gulp.task("images", async () => {
    gulp.src("./app/images/**/*")
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>"),
            })
        )
        .pipe(
            fixmyjs({
                // JSHint settings here
            })
        )
        .pipe(
            imagemin({
                breakOnErrors: false,
            })
        )
        .pipe(gulp.dest(dist + "/images"));
});

gulp.task("clean", async () => {
    gulp.src(dist).pipe(clean());
});

gulp.task("build", gulp.series("jade", "css", "js", "images"));
gulp.task("reload", async (done) => {
    browserSync.reload();
    done();
});
gulp.task("default", async () => {
    browserSync.init({
        server: {
            baseDir: "./dist",
        },
    });
    gulp.watch("./app/*.jade", gulp.series("jade"));
    gulp.watch("./app/css/*.css", gulp.series("css"));
    gulp.watch("./app/js/**/*.js", gulp.series("js"));
    gulp.watch("./app/images/**/*", gulp.series("images"));
    gulp.watch("./dist/**", gulp.series("reload"));
});

gulp.task("main", async () => {
    gulp.src("./app/js/main.js")
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>"),
            })
        )
        .pipe(browserify({ insertGlobals: true, debug: true }))
        //.pipe(uglify())
        .pipe(rename("main.mini.js"))
        .pipe(gulp.dest("./dist"))
        .pipe(gulp.src("./app/*.jade"))
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>"),
            })
        )
        .pipe(jade({ pretty: true }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("./dist"));
});

gulp.task("jsdoc", async (cb) => {
    gulp.src(["README.md", "./app/js/main.js"], { read: false })
        .pipe(jsdoc(cb))
        .pipe(size());
});
