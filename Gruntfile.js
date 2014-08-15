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
		saucelabs: {
			unit: {
				port: 8031,
				credentials: {
					name: 'srcdoc-polyfill',
					key: process.env.SAUCE_ACCESS_KEY
				},
				buildNumber: process.env.TRAVIS_JOB_ID,
				timeout: 1800,
				platforms: require('./build/test-browsers')
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
	grunt.registerTask("test-integration", ["saucelabs"]);
	grunt.registerTask("ci", ["default", "test-integration"]);

	// Default task.
	grunt.registerTask("default", ["jshint", "test-unit"]);

};
