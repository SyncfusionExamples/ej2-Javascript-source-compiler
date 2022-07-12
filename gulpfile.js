'use strict';

var gulp = require('gulp');
var src = ['./src/**/*.ts', './src/**/*.tsx'];
var fs = require('fs');
var path = require('path');
var shelljs = require('shelljs');

var rollup = require('rollup'); // jshint ignore:line
var rollupUglify = require('rollup-plugin-uglify');
var rollupCommonjs = require('rollup-plugin-commonjs');
// var rollupResolve = require('rollup-plugin-node-resolve');
var rollupSourcemaps = require('rollup-plugin-sourcemaps');
var rollupUglifyEs = require('rollup-plugin-uglify-es');
var runSequence = require('run-sequence');


var currentPackage = 'ej2-diagrams'
gulp.task('ship-ts', function () {
    shipSrc('./src/**/*.{ts,tsx}', './dist/ts/', ['./src/**/*.d.ts', './**/index.ts']);
});

function shipSrc(source, destination, ignore) {
    var glob = require('glob');
    var files = glob.sync(source, {
        silent: true,
        ignore: ignore
    });
    for (var i = 0; i < files.length; i++) {
        var file = files[i].split('src/')[1];
        var target = destination + file;
        if (!fs.existsSync(path.dirname(target))) {
            shelljs.mkdir('-p', path.dirname(target));
        }
        fs.writeFileSync(target, fs.readFileSync(files[i]));
    }
}

gulp.task('es-scripts', function (done) {
    runSequence('es5-scripts', 'es6-scripts', done);
});

gulp.task('es5-scripts', function (done) {
    fs.writeFileSync('./src/global.ts', 'export * from \'./index\';\n');
    esScripts('es5', done);
});

gulp.task('es6-scripts', function (done) {
    esScripts('es6', done);
});

function esScripts(sModule, done) {
    var isLocalScript = false;
    if (sModule === 'es5-local') {
        sModule = 'es5';
        isLocalScript = true;
    }
    var tsConfigs = {
        target: sModule,
        module: 'es6',
        lib: ['es5', 'es6', 'es2015.collection', 'es2015.core', 'dom'],
        types: ['jasmine', 'jasmine-ajax', 'requirejs', 'chai'],
        removeComments: false
    };
    var gulpObj = {
        src: src,
        dest: (sModule === 'es5' ? './src' : './dist/src/' + sModule),
        base: 'src'
    };
    if (sModule === 'es5') {
        var gObj = {
            dest: './',
            base: './',
            src: ['./*.ts', './*.tsx']
        };
        if (isLocalScript) {
            gObj.dest = gulpObj.dest = './dist/es5-local';
        }
        compileTSFiles(tsConfigs, gObj, function () {
            compileTSFiles(tsConfigs, gulpObj, done);

        });
    } else {
        compileTSFiles(tsConfigs, gulpObj, done);
    }
}

function compileTSFiles(tsConfigs, gulpObj, tsConfigPath, done) {
    var ts = require('gulp-typescript');
    // Default typescript config
    var defaultConfig = {
        typescript: require('typescript')
    };

    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; ++i) {
        args[i] = arguments[i];
    }

    tsConfigs = args.shift();
    gulpObj = args.shift();
    done = args.pop();

    tsConfigPath = args.length ? args.shift() : 'tsconfig.json';

    var tsProject, tsResult;

    function refreshValue(flag) {
        // Create the typescript project
        tsProject = ts.createProject(tsConfigPath, Object.assign((flag ? { removeComments: false } : {}), defaultConfig, tsConfigs));
        // Get typescript result
        tsResult = gulp.src(gulpObj.src, { base: gulpObj.base })
            .pipe(ts(tsProject))
            .on('error', function (e) {
                done(e);
                process.exit(1);
            });
    }

    // Compile d.ts and minified files
    if (gulpObj.needDts) {
        refreshValue(true);
        tsResult.dts.pipe(gulp.dest(gulpObj.dest));
    }
    refreshValue();
    // Combine and uglify js files using webpack

    if (gulpObj.hasOwnProperty('combine')) {
        var webpackStream = require('webpack-stream');
        var webpack = require('webpack');
        tsResult.js.pipe(webpackStream({
            output: {
                filename: `${currentPackage}${gulpObj.combine ? '.umd.min.js' : '.umd.js'}`,
                libraryTarget: 'umd'
            },
            externals: (gulpObj.externals || []),
            plugins: gulpObj.combine ? [
                new webpack.optimize.UglifyJsPlugin()
            ] : [],
            devtool: gulpObj.combine ? '' : 'inline-source-map',
        })).pipe(gulp.dest(gulpObj.dest))
            .on('end', function () {
                done();
            });
    }
    // Compile normal js files without uglification
    else {
        tsResult.js.pipe(gulp.dest(gulpObj.dest))
            .on('end', function () {
                done();
            });

    }
}

gulp.task('esm-scripts', function (done) {
    runSequence('esm5-scripts', 'esm2015-scripts', done);
});

gulp.task('esm5-scripts', async function () {
    var bObj = distScripts('esm5');
    var bundle = await rollup.rollup(bObj[0]);
    await bundle.write(bObj[1]);
});

gulp.task('esm2015-scripts', async function () {
    var bObj = distScripts('esm2015');
    var bundle = await rollup.rollup(bObj[0]);
    await bundle.write(bObj[1]);
});

function distScripts(scripts, removeSrcMap) { // jshint ignore:line
    var packJson = JSON.parse(fs.readFileSync('./package.json', 'UTF8'));
    packJson.module = './index.js';
    fs.writeFileSync('./package.json', JSON.stringify(packJson), 'UTF8');
    var fileExt = {
            esm5: '.es5',
            esm2015: '.es2015',
        umd: '.umd.min',
        global: '.min'
    };
    var format = {
        umd: 'umd',
        global: 'iife',
        esm5: 'es',
        esm2015: 'es'
    };
    var input = scripts === 'esm2015' ? 'es6' : 'es5';
    var umd = scripts === 'umd';
    var global = scripts === 'global';
    var dir = global ? 'global' : 'es6';
    var file = (umd ? 'dist/' : 'dist/' + dir + '/') + currentPackage + fileExt[scripts] + '.js';
    var writeObj;
    if (removeSrcMap === true) {
        writeObj = {
            file: file,
            format: format[scripts]
        };
    } else {
        writeObj = {
            file: file,
            format: format[scripts],
            sourcemap: true
        };
    }
    var entryPoint = (input === 'es6') ? './dist/src/es6/index.js' : ('./src/' + (global ? 'global' : 'index') + '.js');
    var bundleObj = {
        input: entryPoint,
        plugins: [
            rollupSourcemaps(),
            rollupCommonjs()
        ]
    };
    if (umd || global) {
        writeObj.name = 'ej';
        if (global) {
            writeObj.name = 'ej.' + currentPackage.slice(4).replace(/-/g, '');
            writeObj.footer = 'this.ejs = ej;';
            // bundleObj.plugins = bundleObj.plugins.concat(rollupResolve());
            bundleObj.plugins = bundleObj.plugins.concat(rollupUglifyEs());
        } else {
            bundleObj.plugins = bundleObj.plugins.concat(rollupUglify());
        }
    }
    return [bundleObj, writeObj, file];
}

gulp.task('dist-scripts', function (done) {
    runSequence('ship-ts', 'es-scripts', 'esm-scripts', done);
});
