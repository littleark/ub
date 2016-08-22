module.exports = function(grunt) {

    require('jit-grunt')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        shell: {
            main: {
                command: './node_modules/.bin/jspm bundle-sfx src/main build/main.js',
                options: {
                    execOptions: {
                        cwd: '.'
                    }
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', '!src/server/**'],
            options: {
                esversion: 6,
                asi: true,
                futurehostile: true,
                // options here to override JSHint defaults
                globals: {
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        uglify: {
           dist: {
              options: {
                 sourceMap: true,
                 banner: '/*! ES6 Template | MIT Licensed */'
              },
              files: {
                 'build/main.js': ['build/main.js'],
              }
           }
        },
        copy: {
             harness: {
                files: [
                    {
                        expand: true,
                        cwd: 'harness/',
                        src: ['index.html'],
                        dest: 'build'
                    }
                ]
            },
            assets: {
                files: [
                    {expand: true, cwd: 'src/', src: ['assets/**/*'], dest: 'build'},
                ]
            }
        },
        clean: ["build"],
        sass: {
            options: {
                sourceMap: true
            },
            main: {
                files: {
                    'build/css/main.css':'src/css/main.scss'
                }    
            }
        },
        connect: {
            server: {
                options: {
                    hostname:'0.0.0.0',
                    port:2222,
                    base:'build',
                    middleware: function (connect, options, middlewares) {
                        // inject a custom middleware http://stackoverflow.com/a/24508523
                        middlewares.unshift(function (req, res, next) {
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', '*');
                            return next();
                        });
                        return middlewares;
                    }
                }
            }
        },
        watch: {
            js: {
                files: ["<%= jshint.files %>"],
                tasks: ['jshint','shell:main']//,'uglify']    
            },
            css: {
                files: ["src/css/**/*"],
                tasks: ['sass']
            },
            assets: {
                files: ["src/assets/**/*"],
                tasks: ['copy:assets']
            },
            harness: {
                files: ['harness/**/*'],
                tasks: ['copy:harness']
            }
            
        }

    });

    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    /*
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-browserify');
    */

    grunt.registerTask('server','Connecting...',function() {
        grunt.task.run('connect');
        grunt.log.writeln('Server running');
    })

    grunt.registerTask('test',['jshint']);
    grunt.registerTask('all',['clean','copy:harness','copy:assets','sass:main','jshint','shell:main'])//,'uglify'])
    grunt.registerTask('default',['all','server','watch']);
    grunt.registerTask('build',['all','uglify']);

};