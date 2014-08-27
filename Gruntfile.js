module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: ['tests/filter.spec.js', 'tests/where.spec.js', 'tests/test.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.registerTask('default', ['mochaTest']);

};