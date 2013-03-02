/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		meta: {
			version: '0.1.1-beta',
			pkg: grunt.file.readJSON('package.json'),
			banner: '/*! srcdoc-polyfill - v<%= meta.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* http://github.com/jugglinmike/srcdoc-polyfill/\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
				'Mike Pennisi; Licensed MIT */'
		},
		jshint: {
			files: ['Gruntfile.js', 'srcdoc-polyfill.js'],
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				// The shim relies on script URLs to function
				scripturl: true
			}
		},
		qunit: {
			files: ['test/**/*.html']
		},
		uglify: {
			options: {
				banner: '/*! srcdoc-polyfill - v<%= meta.pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'* http://github.com/jugglinmike/srcdoc-polyfill/\n' +
					'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
					'<%= meta.pkg.author %>; Licensed <%= meta.pkg.license %> */\n'
			},
			dist: {
				files: {
					'srcdoc-polyfill.min.js': 'srcdoc-polyfill.js'
				}
			}
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint qunit'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task.
	grunt.registerTask('default', ['jshint', 'qunit', 'uglify']);

};
