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
      strib: {
        options: {
          hostname: '0.0.0.0',
          port: 8000,
          base: 'public/',
          keepalive: true,
          bin: '/usr/local/bin/php', // This is bad
          open: true
        }
      }
    },
    copy: {
      htmlToPhp: {
        src: 'public/index.html',
        dest: 'public/index.php'
      },
      phpToHtml: {
        src: 'public/index.php',
        dest: 'public/index.html'
      }
    },
    watch: {
      local: {
        files: 'public/index.html',
        tasks: 'copy:htmlToPhp'
      },
      strib: {
        files: 'public/index.php',
        tasks: 'copy:phpToHtml'
      }
    },
    concurrent: {
      local: {
        tasks: ['watch:local', 'connect'],
        options: {
          logConcurrentOutput: true
        }
      },
      strib: {
        tasks: ['watch:strib', 'php'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-php');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('local', ['concurrent:local']);
  grunt.registerTask('strib', ['concurrent:strib']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['local']);

};

