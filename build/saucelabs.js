"use strict";

var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var request = require("https").request;

var Tunnel = require("sauce-tunnel");
var Promise = require("bluebird");

function createStaticServer(port) {
	var server = http.createServer(function(request, response) {
		var uri = url.parse(request.url).pathname;
		var filename = path.join(process.cwd(), uri);

		fs.exists(filename, function(exists) {
			if(!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}

			if (fs.statSync(filename).isDirectory()) {
				filename += "/index.html";
			}

			fs.readFile(filename, "binary", function(err, file) {
				if(err) {
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
					return;
				}

				response.writeHead(200);
				response.write(file, "binary");
				response.end();
			});
		});
	});

	return new Promise(function(resolve, reject) {
		server.listen(port, function(err) {
			if (err) {
				reject(err);
				return;
			}
			resolve(server);
		});
	});
}

function destroyServer(server) {
	return new Promise(function(resolve) {
		server.close(resolve);
	});
}

function openTunnel(creds) {
	var tunnelId = "tunnel-" + (new Date().getTime());
	var tunnel = new Tunnel(creds.name, creds.key, tunnelId, true);

	return new Promise(function(resolve, reject) {
		tunnel.start(function(status) {
			if (status !== true) {
				reject("Unable to open tunnel to Sauce Labs.");
				return;
			}

			resolve({ tunnel: tunnel, tunnelId: tunnelId });
		});
	});
}

function closeTunnel(tunnel) {
	return new Promise(function(resolve) {
		tunnel.stop(resolve);
	});
}

function scheduleTests(creds, port, platforms, tunnelId) {
	var body = JSON.stringify({
		platforms: platforms,
		url: "http://localhost:" + port + "/test/index.html",
		framework: "qunit",
		"tunnel-identifier": tunnelId
	});
	var options = {
		hostname: "saucelabs.com",
		path: "/rest/v1/" + creds.name + "/js-tests",
		method: "POST",
		auth: creds.name + ":" + creds.key,
		headers: {
			"Content-Type": "application/json",
			"Content-Length": body.length
		}
	};

	return new Promise(function(resolve, reject) {
		var req = request(options, function(res) {
			var body = "";

			res.on("data", function(chunk) {
				body += chunk;
			});

			res.on("end", function() {
				if (res.statusCode !== 200) {
					reject(body);
					return;
				}
				resolve(JSON.parse(body)["js tests"]);
			});
		});

		req.on("error", function(err) {
			reject(err);
		});

		req.write(body);
		req.end();
	});
}

function getTestsStatus(ids, creds) {
	var body = JSON.stringify({ "js tests": ids });
	var options = {
		hostname: "saucelabs.com",
		path: "/rest/v1/" + creds.name + "/js-tests/status",
		method: "POST",
		auth: creds.name + ":" + creds.key,
		headers: {
			"Content-Type": "application/json",
			"Content-Length": body.length
		}
	};

	return new Promise(function(resolve, reject) {
		var req = request(options, function(res) {
			var body = "";
			res.on("data", function(chunk) {
				body += chunk;
			});
			res.on("end", function() {
				resolve(JSON.parse(body));
			});
		});
		req.on("error", reject);
		req.write(body);
		req.end();
	});
}

function waitForTestsComplete(ids, timeout, creds, elapsed) {
	var start = (new Date()).getTime();
	var pollInterval = 2000;
	elapsed = elapsed || 0;

	return getTestsStatus(ids, creds)
		.then(function(result) {
			elapsed += (new Date()).getTime() - start;

			if (result.completed) {
				return result["js tests"];
			} else if (elapsed < timeout * 1000) {
				return Promise.delay(pollInterval).then(function() {
					return waitForTestsComplete(ids, timeout, creds, elapsed);
				});
			} else {
				throw new Error(
					"Tests did not complete after " + timeout + " seconds"
				);
			}
		});
}

module.exports = function(grunt) {
	grunt.registerMultiTask(
		"saucelabs",
		"Run tests on various platforms through a remove connection to " +
		"Sauce Labs",
		function() {
			var port = parseInt(this.data.port, 10);
			var creds = this.data.credentials;
			var platforms = this.data.platforms;
			var timeout = this.data.timeout;
			var done = this.async();
			var tunnel, tunnelId, server;

			/**
			 * Terminate all open connections.
			 */
			function cleanup() {
				var operations = [];

				if (server) {
					grunt.log.verbose.writeln("Destroying local server");
					operations.push(destroyServer(server));
				}

				if (tunnel) {
					grunt.log.verbose.writeln(
						"Closing secure tunnel with Sauce Labs"
					);
					operations.push(closeTunnel(tunnel));
				}

				return Promise.all(operations);
			}

			createStaticServer(port)
				.then(function(_server) {
					server = _server;

					grunt.log.verbose.writeln(
						"Establishing secure tunnel with Sauce Labs"
					);

					return openTunnel(creds);
				}).then(function(result) {
					tunnel = result.tunnel;
					tunnelId = result.tunnelId;

					grunt.log.verbose.writeln(
						"Sauce Labs tunnel established."
					);
					grunt.log.verbose.writeln(
						"Requesting Sauce Labs unit test job."
					);

					return scheduleTests(creds, port, platforms, tunnelId);
				}).then(function(ids) {
					grunt.log.verbose.writeln("Waiting for tests to complete");

					return waitForTestsComplete(ids, timeout, creds);
				}).then(function(results) {
					var failures = results.filter(function(test) {
						return test.result.failed > 0;
					});

					if (failures.length) {
						throw new Error(
							failures.length + " platform" +
							(failures.length === 1 ? "" : "s") +
							" failed the tests. Results: " +
							JSON.stringify(failures)
						);
					}

					return results;
				}).then(function(results) {
					grunt.log.writeln(
						"Tests passed on all platforms (" + results.length +
						" total)"
					);

					cleanup().then(done);
				}, function(err) {
					grunt.log.error(err);

					cleanup().then(done.bind(null, false));
				});
		}
	);
};
