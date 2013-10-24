'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 8000,
          base: 'public/',
          keepalive: true,
          open: true
        },
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*.js']
      }
    },
    php: {
      dist: {
        options: {
          hostname: '0.0.0.0',
          port: 8000,
          base: 'public/',
          keepalive: true,
          bin: '/usr/local/bin/php', // This is bad
          open: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-php');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['connect']);
  grunt.registerTask('strib', ['php']);
  grunt.registerTask('test', ['mochaTest']);

};

