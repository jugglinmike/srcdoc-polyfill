/*global module:false*/
module.exports = function(grunt) {
	grunt.loadTasks('build');

	// Project configuration.
	grunt.initConfig({
		meta: {
			pkg: grunt.file.readJSON("package.json")
		},
		jshint: {
			build: {
				src: ["Gruntfile.js", "build/*.js"],
				options: {
					jshintrc: "build/.jshintrc"
				}
			},
			src: {
				src: ["srcdoc-polyfill.js"],
				options: {
					jshintrc: ".jshintrc"
				}
			}
		},
		qunit: {
			files: ["test/**/*.html"]
		},
		"saucelabs-qunit": {
			all: {
				options: {
					username: "srcdoc-polyfill",
					testname: "srcdoc polyfill",
					build: process.env.CI_BUILD_NUMBER,
					urls: ["http://localhost:8023/test/index.html"],
					browsers: [{
						browserName: 'firefox',
					}, {
						browserName: 'firefox',
						version: 19
					}]
				}
			}
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
	grunt.loadNpmTasks("grunt-saucelabs");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	grunt.registerTask("test-unit", ["qunit"]);
	grunt.registerTask("test-integration", ["server:8023", "saucelabs-qunit"]);
	grunt.registerTask("ci", ["jshint", "test-unit", "test-integration"]);
	// Default task.
	grunt.registerTask("default", ["jshint", "test-unit"]);

};
