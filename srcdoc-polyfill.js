(function(root, factory) {
	// `root` does not resolve to the global window object in a Browserified
	// bundle, so a direct reference to that object is used instead.
	var _srcDoc = window.srcDoc;

	if (typeof define === "function" && define.amd) {
		define(['exports'], function(exports) {
			factory(exports, _srcDoc);
			root.srcDoc = exports;
		});
	} else if (typeof exports === "object") {
		factory(exports, _srcDoc);
	} else {
		root.srcDoc = {};
		factory(root.srcDoc, _srcDoc);
	}
})(this, function(exports, _srcDoc) {
	var idx, iframes;
	var isCompliant = !!("srcdoc" in document.createElement("iframe"));
	var sandboxMsg = "Polyfill may not function in the presence of the " +
		"`sandbox` attribute. Consider using the `force` option.";
	var sandboxAllow = /\ballow-same-origin\b/;
	/**
	 * Determine if the operation may be blocked by the `sandbox` attribute in
	 * some environments, and optionally issue a warning or remove the
	 * attribute.
	 */
	var validate = function( iframe, options ) {
		var sandbox = iframe.getAttribute("sandbox");
		if (typeof sandbox === "string" && !sandboxAllow.test(sandbox)) {
			if (options && options.force) {
				iframe.removeAttribute("sandbox");
			} else if (!options || options.force !== false) {
				logError(sandboxMsg);
				iframe.setAttribute("data-srcdoc-polyfill", sandboxMsg);
			}
		}
	};
	var implementations = {
		compliant: function( iframe, content, options ) {

			if (content) {
				validate(iframe, options);
				iframe.setAttribute("srcdoc", content);
			}
		},
		legacy: function( iframe, content, options ) {

			var jsUrl;

			if (!iframe || !iframe.getAttribute) {
				return;
			}

			if (!content) {
				content = iframe.getAttribute("srcdoc");
			} else {
				iframe.setAttribute("srcdoc", content);
			}

			if (content) {
				validate(iframe, options);

				// The value returned by a script-targeted URL will be used as
				// the iFrame's content. Create such a URL which returns the
				// iFrame element's `srcdoc` attribute.
				jsUrl = "javascript: window.frameElement.getAttribute('srcdoc');";

				// Explicitly set the iFrame's window.location for
				// compatability with IE9, which does not react to changes in
				// the `src` attribute when it is a `javascript:` URL, for
				// some reason
				if (iframe.contentWindow) {
					iframe.contentWindow.location = jsUrl;
				}

				iframe.setAttribute("src", jsUrl);
			}
		}
	};
	var srcDoc = exports;
	var logError;

	if (window.console && window.console.error) {
		logError = function(msg) {
			window.console.error("[srcdoc-polyfill] " + msg);
		};
	} else {
		logError = function() {};
	}

	// Assume the best
	srcDoc.set = implementations.compliant;
	srcDoc.noConflict = function() {
		window.srcDoc = _srcDoc;
		return srcDoc;
	};

	// If the browser supports srcdoc, no shimming is necessary
	if (isCompliant) {
		return;
	}

	srcDoc.set = implementations.legacy;

	// Automatically shim any iframes already present in the document
	iframes = document.getElementsByTagName("iframe");
	idx = iframes.length;

	while (idx--) {
		srcDoc.set( iframes[idx] );
	}

});
