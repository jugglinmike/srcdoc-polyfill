// createDocument
// Create a new document within an iFrame that contains:
// 1) an iFrame declaring some combination of `src` and `srcdoc`
// 2) the polyfill itself
// Used to test automatic shimming functionality
function createDocument( iframe, insertions ) {
	var doc = iframe.contentWindow.document;
	var html = "<html><body><iframe></iframe>" +
		"<script src=\"../srcdoc-polyfill.js\"></script></body></html>";

	if (insertions.srcdoc) {
		html = html.replace(/iframe/, "iframe srcdoc=\"<html>" + insertions.srcdoc + "</html>\"");
	}

	if (insertions.src) {
		html = html.replace(/iframe/, "iframe src=\"" + insertions.src + "\"");
	}

	doc.open();

	doc.write(html);

	doc.close();
}

module("srcDoc.noConflict()", {
	teardown: function() {
		// Restore srcDoc to the global
		window.srcDoc = this._srcDoc;

		// Remove the global reference
		delete this._srcDoc;
	}
});

test("will restore original value", 3, function() {

	var preNoConflict = srcDoc;

	equal(typeof window.srcDoc, "object",
		"srcDoc has been overwritten to an object");

	// Restore to old srcDoc, and keep a copy of srcDoc in window._srcDoc
	this._srcDoc = window.srcDoc.noConflict();

	equal(window.srcDoc, "old", "srcDoc has been restored to the old value");
	equal(this._srcDoc, preNoConflict, "Returns a reference to the API");
});

module("srcDoc.set()", {
	setup: function() {
		this.$harness = $("<iframe>").appendTo("#qunit-fixture");
	},
	teardown: function() {
		this.$harness.remove();
	}
});

test("set content (as explicitly specified) of src-less iFrame", 1, function() {

	var $harness = this.$harness;
	var content = "Hey there, <b>world</b>";
	var regex = /Hey there, <b>world<\/b>/i;

	stop();

	$harness.one("load", function() {
		ok(regex.test($harness.contents().children().html()),
			"The iFrame contains the specified content");
		start();
	});
	
	srcDoc.set($harness.get(0), content);

});

test("set content (as explicitly specified) of src-ful iFrame", 1, function() {

	var $harness = this.$harness;
	var content = {
		srcdoc: "<html><head><title>Hello down there!</title></head></html>",
		src: "javascript: 'Hey there, <b>world</b>'"
	};
	var regex = /<head>\s*<title>\s*Hello down there!\s*<\/title>\s*<\/head>/i;

	stop();

	$harness.one("load", function() {
		$harness.one("load", function() {
			ok(regex.test($harness.contents().children().html()),
				"The iFrame contains the specified content");
			start();
		});
		srcDoc.set($harness.get(0), content.srcdoc);
	});

	$harness.attr("src", content.src);
});

test("set content (as inferred from current `srcdoc` attribute) of src-less iFrame", 1, function() {

	var $harness = this.$harness;
	var content = "Hey there, <b>world</b>";
	var regex = /Hey there, <b>world<\/b>/i;

	stop();

	// Will trigger a "load" event in compliant browsers, so set it before
	// binding
	$harness.attr("srcdoc", content);

	$harness.one("load", function() {
		ok(regex.test($harness.contents().children().html()),
			"The iFrame contains the specified content");
		start();
	});

	srcDoc.set($harness.get(0));

});

test("set content (as inferred from current `srcdoc` attribute) of src-ful iFrame", 1, function() {

	var $harness = this.$harness;
	var content = {
		srcdoc: "Hey there, <b>world</b>",
		src: "javascript: 'Mark'"
	};
	var regex = /Hey there, <b>world<\/b>/i;

	stop();

	// Will trigger a "load" event in compliant browsers, so set it before
	// binding
	$harness.attr("srcdoc", content.srcdoc);

	$harness.one("load", function() {


		$harness.one("load", function() {

			ok(regex.test($harness.contents().children().html()),
				"The iFrame contains the specified content");
			start();

		});

		srcDoc.set($harness.get(0), content.srcdoc);

	});

	$harness.attr("src", content.src);

});

/* Issue #2: Content length limited to 4080 chars in Internet Explorer
 * Browsers enforce limits on the length of URLs (for instance, Internet
 * Explorer 8 does not support URLs longer than 2,083 characters in length[1].
 * Ensure that srcDoc operates even in cases where the content is far longer
 * than the maximum-allowed URL length.
 */
test("set content longer than 4020 characters in length", 1, function() {

	var $harness = this.$harness;
	var content = new Array(5001).join("M");
	var regex = /M{5000}/i;

	stop();

	$harness.one("load", function() {
		ok(regex.test($harness.contents().children().html()),
			"The iFrame contains the specified content");
		start();
	});

	srcDoc.set($harness.get(0), content);

});

test("set content with non-ASCII characters", 1, function() {

	var $harness = this.$harness;
	var special = String.fromCharCode(1601);
	var content = "<head><meta charset='UTF-8'></head><body>" + special +
		"</body>";
	var regex = new RegExp(special);

	stop();

	$harness.one("load", function() {
		ok(regex.test($harness.contents().children().html()),
			"The iFrame contains the specified content");
		start();
	});

	srcDoc.set($harness.get(0), content);

});

module("Automatic shimming", {
	setup: function() {
		this.$harness = $("<iframe>").appendTo("#qunit-fixture");
	},
	teardown: function() {
		this.$harness.remove();
	}
});

test("iFrame declaring src only", 1, function() {
	var src = "javascript: 'Hello, <b>world</b>'";
	var regex = /Hello, <b>world<\/b>/i;
	var $harness = this.$harness;

	stop();

	this.$harness.on("load", function() {
		ok(regex.test(
			$harness.contents().children().find("iframe")
				.contents().children().html()),
			"Does not modify iFrame");
		start();
	});

	createDocument(this.$harness[0], { src: src });
});

test("iFrame declaring both src and srcdoc", 1, function() {
	var $harness = this.$harness;
	var src = "javascript: 'Hello, <b>world</b>'";
	var srcdoc = "<head><title>This is a title</title></head><body>Mike</body>";
	var regex = /^<head>\s*<title>This is a title<\/title>\s*<\/head>\s*<body>\s*Mike\s*<\/body>$/i;

	stop();

	this.$harness.on("load", function() {
		ok(regex.test(
			$harness.contents().children().find("iframe")
				.contents().children().html()),
			"Correctly sets the content of iFrame");
		start();
	});

	createDocument(this.$harness[0], { src: src, srcdoc: srcdoc });
});

test("iFrame declaring srcdoc only", 1, function() {
	
	var $harness = this.$harness;
	var srcdoc = "<head><title>This is a title</title></head><body>Mike</body>";
	var regex = /^<head>\s*<title>This is a title<\/title>\s*<\/head>\s*<body>\s*Mike\s*<\/body>$/i;

	stop();

	this.$harness.on("load", function() {
		ok(regex.test(
			$harness.contents().children().find("iframe")
				.contents().children().html()),
			"Correctly sets the content of iFrame");
		start();
	});

	createDocument(this.$harness[0], { srcdoc: srcdoc });
});
