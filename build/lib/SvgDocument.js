'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cheerio = require('cheerio');

/**
 * SVG Document
 * - Generates SVG content.
 * - Parses the content of a SVG document.
 * @class SvgDocument
 */

var SvgDocument = function () {

    /**
     * Parses the given content.
     * @param {string} content - the content of a SVG file.
     */
    function SvgDocument(content) {
        _classCallCheck(this, SvgDocument);

        var $ = cheerio.load(content, { normalizeWhitespace: true, xmlMode: true });

        this.$svg = $('svg');
    }

    /**
     * Creates an SVG document with the given contents.
     * @param {...string} contents - contents to be included in the document.
     * @returns {string}
     */


    _createClass(SvgDocument, [{
        key: 'getAttribute',


        /**
         * Gets the value of the attribute with the given name.
         * @param {string} name - the name of the attribute.
         * @returns {string}
         */
        value: function getAttribute(name) {
            var $svg = this.$svg;
            return $svg.attr(name) || $svg.attr(name.toLowerCase());
        }

        /**
         * Gets the value of the viewBox attribute.
         * @returns {string}
         */

    }, {
        key: 'getViewBox',
        value: function getViewBox() {
            return this.getAttribute('viewBox');
        }

        /**
         * Converts a SVG document into a <symbol/> element.
         * @param {string} id - the symbol id.
         * @returns {string}
         */

    }, {
        key: 'toSymbol',
        value: function toSymbol(id) {
            var _this = this;

            var $svg = this.$svg;
            var attrs = ['id="' + id + '"'];

            ['class', 'preserveAspectRatio', 'viewBox'].forEach(function (name) {
                var value = _this.getAttribute(name);

                if (value) {
                    attrs.push(name + '="' + value + '"');
                }
            });

            return SvgDocument.createSymbol(attrs, $svg.html());
        }
    }], [{
        key: 'create',
        value: function create() {
            for (var _len = arguments.length, contents = Array(_len), _key = 0; _key < _len; _key++) {
                contents[_key] = arguments[_key];
            }

            return '<svg xmlns="http://www.w3.org/2000/svg">' + contents.join('') + '</svg>';
        }

        /**
         * Creates a <defs/> element with the given contents.
         * @param {...string} contents - contents to be included in the element.
         * @returns {string}
         */

    }, {
        key: 'createDefs',
        value: function createDefs() {
            for (var _len2 = arguments.length, contents = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                contents[_key2] = arguments[_key2];
            }

            return '<defs>' + contents.join('') + '</defs>';
        }

        /**
         * Creates a <symbol/> element with the given contents.
         * @param {string[]} attrs - attributes to be included in the element.
         * @param {..string} contents - contents to be included in the element.
         * @returns {string}
         */

    }, {
        key: 'createSymbol',
        value: function createSymbol() {
            var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            for (var _len3 = arguments.length, contents = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                contents[_key3 - 1] = arguments[_key3];
            }

            return '<symbol ' + attrs.join(' ') + '>' + contents.join('') + '</symbol>';
        }
    }]);

    return SvgDocument;
}();

module.exports = SvgDocument;