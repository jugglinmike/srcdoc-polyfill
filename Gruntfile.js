/*global module:false*/
module.exports = function(grunt) {
	grunt.loadTasks('build');

	grunt.registerTask("saucelabs", function() {
		var sauceCreds = {
			name: 'srcdoc-polyfill',
			key: process.env.SAUCE_ACCESS_KEY
		};
		var request = require('https').request;
		var Tunnel = require('sauce-tunnel');
		var tunnelId = 'tunnel-' + (new Date().getTime());
		var tunnel = new Tunnel('srcdoc-polyfill', sauceCreds.key, tunnelId, true);

		var done = this.async();

		grunt.log.verbose.writeln(
			'Attempting to open tunnel to Sauce Labs with ID: "' + tunnelId +
			'".'
		);

		tunnel.on('verbose:debug', grunt.log.verbose.writeln.bind(grunt.log.verbose));
		tunnel.start(function(status) {
			if (status !== true) {
				grunt.log.error('Unable to open tunnel to Sauce Labs.');
				done(false);
				return;
			}

			grunt.log.verbose.writeln('Sauce Labs tunnel established.');

			var body = JSON.stringify({
				platforms: [["Windows 7", "firefox", "27"]],
				url: 'http://localhost:8031/test/index.html',
				framework: 'qunit',
				'tunnel-identifier': tunnelId
			});
			var options = {
				hostname: 'saucelabs.com',
				path: '/rest/v1/' + sauceCreds.name + '/js-tests',
				method: 'POST',
				auth: sauceCreds.name + ':' + sauceCreds.key,
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': body.length
				}
			};
			var req = request(options, function(res) {
				var body = '';

				res.on('data', function(chunk) {
					body += chunk;
				});

				res.on('end', function() {
					grunt.log.verbose.writeln(body);

					if (res.statusCode !== 200) {
						tunnel.stop(done.bind(null, body));
						return;
					}

					whenComplete(JSON.parse(body)['js tests'], function(err, result) {
						tunnel.stop(function() {
							var failures, errorMsg;

							if (err) {
								grunt.log.error(err);
								done(false);
								return;
							}

							failures = result['js tests'].filter(function(test) {
								return test.result.failed > 0;
							});

							if (failures.length) {
								grunt.log.error(
									failures.length + ' platform' +
									(failures.length === 1 ? '' : 's') +
									' failed the tests. Results: ' +
									JSON.stringify(failures)
								);
								done(false);
								return;
							}
							done();
						});
					});
				});
			});

			req.on('error', function(err) {
				tunnel.stop(function() {
					grunt.log.error(err);
					done(false);
				});
			});

			grunt.log.verbose.writeln('Requesting Sauce Labs unit test job.');
			req.write(body);
			req.end();
		});

		function whenComplete(ids, callback) {
			var body = JSON.stringify({ 'js tests': ids });
			var options = {
				hostname: 'saucelabs.com',
				path: '/rest/v1/' + sauceCreds.name + '/js-tests/status',
				method: 'POST',
				auth: sauceCreds.name + ':' + sauceCreds.key,
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': body.length
				}
			};
			var req = request(options, function(res) {
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function() {
					var result = JSON.parse(body);
					if (result.completed) {
						callback(null, result);
						return;
					}

					setTimeout(whenComplete.bind(null, ids, callback), 1000);
				});
			});
			req.on('error', callback);
			req.write(body);
			req.end();
		}
	});

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
	grunt.registerTask("test-integration", ["server:8031", "saucelabs"]);
	grunt.registerTask("ci", ["jshint", "test-unit", "test-integration"]);
	// Default task.
	grunt.registerTask("default", ["jshint", "test-unit"]);

};
