// gulp
const gulp = require("gulp");
// server
const browserSync = require("browser-sync").create();
// special tools
const clean = require("gulp-clean");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
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

const dist = "./dist";

gulp.task("jade", async () => {
    gulp.src("./app/*.jade")
        .pipe(jade({ pretty: true }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("./dist"));
});

gulp.task("css", async () => {
    gulp.src("./app/css/*.css")
        .pipe(concat("main.mini.css"))
        .pipe(
            autoprefixer({
                cascade: false,
            })
        )
        .pipe(csso())
        .pipe(gulp.dest(dist));
});

gulp.task("js", async () => {
    gulp.src("./app/js/**/*.js")
        .pipe(browserify({ insertGlobals: true, debug: true }))
        //.pipe(uglify())
        .pipe(rename("main.mini.js"))
        .pipe(gulp.dest("./dist"));
});
gulp.task("images", async () => {
    gulp.src("./app/images/**/*")
        .pipe(imagemin())
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
