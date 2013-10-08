'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 8000,
          base: 'public/',
          keepalive: true
        },
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['connect']);
  grunt.registerTask('server', ['connect']);
  grunt.registerTask('test', ['mochaTest']);

};

