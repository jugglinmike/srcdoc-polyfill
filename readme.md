# `srcdoc` polyfill [![Build Status](https://travis-ci.org/jugglinmike/srcdoc-polyfill.svg)](https://travis-ci.org/jugglinmike/srcdoc-polyfill)

HTML5 defines a new attribute for iFrames named	`srcdoc`. This attribute allows
developers to specify an iFrame's content in-line with the iFrame itself. For
instance:

	<iframe srcdoc="<html><body>Hello, <b>world</b>.</body></html>"></iframe>

This feature only began to see adoption in major browsers in early 2013.
Fortunately, most older browsers support similar functionality through
script-targeted URLs, i.e.

	<iframe src="javascript: '<html><body>Hello, <b>world</b>.</body></html>'"></iframe>

(Because of limitations on URL length, the actual mechanism that the polyfill
implements not quite this direct.)

For more on `srcdoc`, see [the WhatWG specification](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#attr-iframe-srcdoc) and [this post on
Bocoup.com](http://weblog.bocoup.com/third-party-javascript-development-future/).

## Usage

By including the script at the bottom of the document `<body>`, any available
iFrames which declare a `srcdoc` attribute attribute) will receive this
"shimmed" behavior. (In browsers that already implement this functionality, no
change will take place.)

**Note on [the HTML5 `sandbox`
attribute](https://html.spec.whatwg.org/multipage/embedded-content.html#attr-iframe-sandbox):**
Because the shim operates using a script-targeted URL in legacy environments,
some configurations of the `sandbox` attribute may interfere with its behavior.
This issue will only surface in environments that implement `sandbox` but that
do *not* implement `srcdoc`. Because of this, this polyfill's default behavior
is to issue a warning for potentially-hazardous configurations but to proceed
optimistically. The API supports an `force` option that enables modification of
this behavior.

## Executing

This script may be consumed as a AMD module, a CommonJS module, or standalone
via direct inclusion with a `<script>` element.

## API

The shim also defines a minimal JavaScript API:

* `srcDoc.set( iframe [, content [, options ] ] )` - sets the content of the
  provided iFrame element using the `srcdoc` attribute where available (falling
  back on a script-targeted URL in non-supporting browsers).
  * `content` (optional) - The desired content of the iFrame. If blank, the
    current value of the element's `srcdoc` attribute will be referenced for
    content.
  * `options` (optional) - An object used to specify low-level behavior.
    Supports a single attribute, `force`, for controlling behavior in the
    presence of the `sandbox` attribute (see the note in "Usage" section of
    this document).
    * If unspecified, a warning will be issued and the library will attempt to
      shim the `srcdoc` behavior optimistically.
    * If `true`, then the target iFrame's `sandbox` attribute will be removed
      prior to setting the content. Note that this
    * If `false`, no warning will be issued and the library will attempt to
      shim the `srcdoc` behavior optimistically.
* `srcDoc.noConflict()` - Sets the value of the global `srcDoc` variable to its
  original value. Returns the `srcDoc` object defined by this project for
  re-aliasing.

## Browser Support

Tested in the following browsers:

* Microsoft Internet Explorer
  * 6, 7, 8, 9, 10, 11
* Microsoft Edge
  * 13, 14
* Apple Safari
  * 4, 5.0, 5.1, 6, 6.2, 7.1, 8, 9.1, 10
* Google Chrome
  * 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24.0.1312.5 (beta), 25.0.1364.5
    (dev), 55
* Opera
  * 11.1, 11.5, 11.6, 12.10, 12.11 (beta), 42
* Mozilla FireFox
  * 3.0, 3.6, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 (beta), 50

The following browsers are *not* supported:

* Opera 10.0

## Building

The build process for this project is written with
[Grunt.js](http://gruntjs.com). Please refer to the grunt documentation for
details on installing grunt.

## Tests

The shim's tests are written in QUnit, and can be run by visiting the
`test/index.html` file in the browser, or by running `grunt test` from the
command line.

## Release Notes

- `1.0.0` (2017-01-29)
  - Warn in the presence of the `sandbox` attribute if its value may cause
    issues in environments that support it
- `0.2.0` (2015-10-02)
  - Wrap in "UMD" pattern, enabling more natural consumption from CommonJS and
    AMD environments
- `0.1.1` (2013-03-01)
  - Allow content length to exceed the limit browsers impose on URLs
- `0.1.0` (2012-06-13)
  - Initial release

## License

Copyright (c) 2012 Mike Pennisi  
Licensed under the MIT license.
