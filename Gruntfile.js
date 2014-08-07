/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		meta: {
			pkg: grunt.file.readJSON("package.json")
		},
		jshint: {
			files: ["Gruntfile.js", "srcdoc-polyfill.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},
		qunit: {
			files: ["test/**/*.html"]
		},
		uglify: {
			options: {
				banner: "/*! srcdoc-polyfill - v<%= meta.pkg.version %> - " +
					"<%= grunt.template.today('yyyy-mm-dd') %>\n" +
					"* http://github.com/jugglinmike/srcdoc-polyfill/\n" +
					"* Copyright (c) <%= grunt.template.today('yyyy') %> " +
					"<%= meta.pkg.author %>; Licensed <%= meta.pkg.license %> */\n"
			},
			dist: {
				files: {
					"srcdoc-polyfill.min.js": "srcdoc-polyfill.js"
				}
			}
		},
		watch: {
			files: "<config:lint.files>",
			tasks: "lint qunit"
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	grunt.registerTask("test", ["jshint", "qunit"]);
	// Default task.
	grunt.registerTask("default", ["test", "uglify"]);

};
