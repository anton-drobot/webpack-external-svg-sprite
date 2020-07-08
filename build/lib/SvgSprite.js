'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var loaderUtils = require('loader-utils');

var SvgDocument = require('./SvgDocument');
var SvgIcon = require('./SvgIcon');

/**
 * SVG Sprite
 * @class SvgSprite
 */

var SvgSprite = function () {

    /**
     * Initializes all sprite properties.
     * @param {string} resourcePath - the relative path for the sprite based on the output folder.
     */
    function SvgSprite(resourcePath) {
        _classCallCheck(this, SvgSprite);

        var name = path.basename(resourcePath).match(/(?!\[[^[\]]*)\w+(?![^[\]]*])/)[0];

        var originalPathRegExp = resourcePath.replace(new RegExp('\\[', 'g'), '\\[').replace(new RegExp('\\]', 'g'), '\\]');

        this.content = '';
        this.name = name;
        this.originalPath = resourcePath;
        this.originalPathRegExp = new RegExp(originalPathRegExp, 'gm');
        this.resourcePath = resourcePath;
        this.icons = {};
    }

    /**
     * Adds an icon to the sprite.
     * @param {string} resourcePath - the icon absolute path.
     * @param {string} content - the icon content.
     * @param {string} prefix - the prefix to be prepended to the icon names.
     * @param {string} suffix - the suffix to be appended to the icon names.
     * @return {SvgIcon}
     */


    _createClass(SvgSprite, [{
        key: 'addIcon',
        value: function addIcon(resourcePath, content, _ref) {
            var prefix = _ref.prefix,
                suffix = _ref.suffix;

            var icons = this.icons;

            if (!(resourcePath in icons)) {
                icons[resourcePath] = new SvgIcon(this, resourcePath, content, { prefix: prefix, suffix: suffix });
            }

            return icons[resourcePath];
        }

        /**
         * Generates the sprite content based on the icons.
         * @return {string}
         */

    }, {
        key: 'generate',
        value: function generate() {

            // Get sprite properties
            var icons = this.icons;

            // Lists of symbols to be included in the sprite.

            var symbols = [];

            // For every icon in the sprite
            for (var iconPath in icons) {
                if (icons.hasOwnProperty(iconPath)) {

                    // Get the icon metadata
                    var icon = icons[iconPath];

                    // Create an SVG Document out of the icon contents
                    var svg = icon.getDocument();

                    // Create the icon <symbol/> and add it to the list of symbols
                    symbols.push(svg.toSymbol(icon.symbolName));
                }
            }

            // Generate the sprite content with the following format:
            // <svg>
            //   <defs>
            //       ...<symbol />
            //   </defs>
            // </svg>
            var content = SvgDocument.create(SvgDocument.createDefs.apply(SvgDocument, symbols));

            // Generate interpolated name
            this.resourcePath = loaderUtils.interpolateName({}, this.originalPath, { content: content });
            this.content = content;

            return content;
        }
    }]);

    return SvgSprite;
}();

module.exports = SvgSprite;