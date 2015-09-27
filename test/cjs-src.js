var original = window.srcDoc;
var exportedValue = require("../");

if (window.srcDoc !== original) {
	throw new Error("The bundled package should not define a global variable.");
}

window.srcDoc = exportedValue;
