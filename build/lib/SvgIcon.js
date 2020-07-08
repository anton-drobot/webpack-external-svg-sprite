'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');

var SvgDocument = require('./SvgDocument');

/**
 * SVG Icon
 * - Stores an icon metadata and its content.
 * @class SvgIcon
 */

var SvgIcon = function () {

    /**
     * Generates the icon names based on the given path, prefix and suffix.
     * @constructor
     * @param {SvgSprite} sprite - the sprite where the icon will be placed.
     * @param {string} resourcePath - the absolute path to the icon file.
     * @param {string} content - the icon src code.
     * @param {string} prefix - the prefix for symbol and view names.
     * @param {string} suffix - the icon name suffix.
     */
    function SvgIcon(sprite, resourcePath, content, _ref) {
        var prefix = _ref.prefix,
            suffix = _ref.suffix;

        _classCallCheck(this, SvgIcon);

        // Get the file name
        var filename = path.basename(resourcePath);

        // Get the icon name by removing the extension form the file name
        var name = filename.substring(0, filename.indexOf('.'));

        var symbolName = function () {
            // Get the icon symbol name
            var symbolName = name + suffix; //TODO: Check if this is correct (concat w/ suffix)

            // Prepend the prefix to the symbol name
            if (prefix) {
                symbolName = prefix + symbolName;
            }

            // Append the suffix to the symbol name
            if (suffix) {
                symbolName += suffix;
            }

            return symbolName;
        }();

        this.content = content;
        this.name = name;
        this.sprite = sprite;
        this.resourcePath = resourcePath;
        this.symbolName = symbolName;
    }

    /**
     * Gets the document.
     * @returns {SvgDocument}
     */


    _createClass(SvgIcon, [{
        key: 'getDocument',
        value: function getDocument() {
            return new SvgDocument(this.content);
        }

        /**
         * Gets the name of icon.
         * @returns {string}
         */

    }, {
        key: 'getName',
        value: function getName() {
            return this.name;
        }

        /**
         * Generate URL to the icon symbol.
         * @param {string} [publicPath] - the public path from which the sprite will be served
         * @returns {string}
         */

    }, {
        key: 'getUrlToSymbol',
        value: function getUrlToSymbol(publicPath) {
            publicPath = publicPath ? publicPath.replace(/\/+$/, '') : '';

            return publicPath + '/' + this.sprite.resourcePath + '#' + this.symbolName;
        }
    }]);

    return SvgIcon;
}();

module.exports = SvgIcon;