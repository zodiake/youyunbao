var path = require('path');

module.exports = function (grunt) {
    grunt.initConfig({
        express: {
            options: {
                port: 3000,
                bases: 'www-root',
                server: path.resolve('./bin/www')
            },
            livereload: {
                options: {
                    server: path.resolve('./bin/www'),
                    livereload: true,
                    serverreload: true,
                    bases: [path.resolve('./public')]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express');

    grunt.registerTask('default', ['express', 'express-keepalive']);
};
