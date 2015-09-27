/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		meta: {
			pkg: grunt.file.readJSON("package.json")
		},
		jshint: {
			build: {
				src: ["Gruntfile.js"],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			source: {
				src: ["srcdoc-polyfill.js"],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			test: {
				src: ["test/*.js"],
				options: {
					jshintrc: "test/.jshintrc"
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 8023,
					base: "."
				}
			}
		},
		qunit: {
			exportsGlobal: {
				options: {
					urls: [
						"http://localhost:8023/test/index.html?testSource=global"
					]
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
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	grunt.registerTask("test", ["jshint", "connect", "qunit"]);
	// Default task.
	grunt.registerTask("default", ["test", "uglify"]);

};
