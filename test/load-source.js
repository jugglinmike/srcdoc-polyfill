/**
 * @file - Test utility to facilitate loading different builds of the source
 * code depending on the URL used to access the document.
 */
(function(window) {
	"use strict";
	var sources = {
		global: {
			prereqs: ["../srcdoc-polyfill.js"],
			setup: function(done) {
				done();
			}
		},
		// Ensure that the global variable is defined even in AMD-supporting
		// environments.
		amdGlobal: {
			prereqs: ["../node_modules/requirejs/require.js"],
			setup: function(done) {
				require(["../srcdoc-polyfill"], function(srcDoc) {
					done();
				});
			}
		},
		amdModule: {
			prereqs: ["../node_modules/requirejs/require.js"],
			setup: function(done) {
				require(["../srcdoc-polyfill"], function(srcDoc) {
					window.srcDoc = srcDoc;
					done();
				});
			}
		},
		cjs: {
			prereqs: ["cjs-built.js"],
			setup: function(done) {
				done();
			}
		}
	};

	function loadScript(script, done) {
		var el = document.createElement("script");
		el.src = script;

		if (el.addEventListener) {
			el.addEventListener("load", done);
		} else {
			el.onreadystatechange = function() {
				if ( done && (!this.readyState ||
					this.readyState === "loaded" || this.readyState === "complete") ) {
					done();
					done = null;
				}
			};
		}

		document.getElementsByTagName('head')[0].appendChild(el);
	}

	function loadScripts(scripts, done) {
		if (scripts.length === 0) {
			setTimeout(done, 0);
			return;
		}
		loadScript(scripts.shift(), function() {
			loadScripts(scripts, done);
		});
	}

	function getSource(search) {
		var params = search.slice(1).split("&");
		var sourceName = "global";
		var idx, length, parts;

		for (idx = 0, length = params.length; idx < length; ++idx) {
			parts = params[idx].split("=");
			if (parts[0] === "moduleFmt") {
				sourceName = parts[1];
			}
		}
		return sourceName;
	}

	window.loadSource = function(location, done) {
		var source = sources[getSource(location.search)];
		loadScripts(source.prereqs, function() {
			source.setup(done);
		});
	};
}(this));
