var glob = require('glob'),
    fs = require('fs'),
    path = require('path')

module.exports = function(grunt) {
  
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.initConfig({
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: /<!-- gol -->/,
              replacement: function() {
                var files = glob.sync('./src/*.js')
                return files.map(function(f) {
                  return '<script src="/' + f + '"></script>';
                }).join("\n")
              }
            },
            {
              match: /<!-- shaders -->/,
              replacement: function() {
                var files = glob.sync('./src/shaders/*')
                return files.map(function(f) {
                  return '<script type="x-shader" id="' + path.basename(f) + '">\n' 
                         + fs.readFileSync(f) + "\n"
                         + '</script>'
                }).join("\n")
              }
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['src/index.html'], dest: 'dest/'}
        ]
      }
    },

    watch: {
      scripts: {
        files: ['src/**/*'],
        tasks: ['replace']
      }
    }
  });

  grunt.registerTask('default', ['replace', 'watch']);

};
