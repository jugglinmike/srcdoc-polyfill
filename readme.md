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

## Executing

This script may be consumed as a AMD module, a CommonJS module, or standalone
via direct inclusion with a `<script>` element.

## API

The shim also defines a minimal JavaScript API:

* `srcDoc.set( iframe [, content] )` - sets the content of the provided iFrame
  element using the `srcdoc` attribute where available (falling back on a
  script-targeted URL in non-supporting browsers). The desired content of the
  iFrame may optionally be specified. If blank, the current value of the
  element's `srcdoc` attribute will be referenced for content.
* `srcDoc.noConflict()` - Sets the value of the global `srcDoc` variable to its
  original value. Returns the `srcDoc` object defined by this project for
  re-aliasing.

## Browser Support

Tested in the following browsers:

* Microsoft Internet Explorer
  * 6, 7, 8, 9, 10
* Safari
  * 4, 5.0, 5.1
* Google Chrome
  * 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24.0.1312.5 (beta), 25.0.1364.5
    (dev)
* Opera
  * 11.1, 11.5, 11.6, 12.10, 12.11 (beta)
* Mozilla FireFox
  * 3.0, 3.6, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 (beta)

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
