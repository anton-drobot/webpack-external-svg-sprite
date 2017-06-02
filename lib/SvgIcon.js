'use strict';

const path = require('path');

const SvgDocument = require('./SvgDocument');

/**
 * SVG Icon
 * - Stores an icon metadata and its content.
 */
class SvgIcon {

    /**
     * Generates the icon names based on the given path, prefix and suffix.
     * @constructor
     * @param {SvgSprite} sprite - the sprite where the icon will be placed.
     * @param {string} resourcePath - the absolute path to the icon file.
     * @param {string} content - the icon src code.
     * @param {string} prefix - the prefix for symbol and view names.
     * @param {string} suffix - the icon name suffix.
     */
    constructor(sprite, resourcePath, content, { prefix, suffix }) {

        // Get the file name
        const filename = path.basename(resourcePath);

        // Get the icon name by removing the extension form the file name
        const name = filename.substring(0, filename.indexOf('.'));

        // Get the icon symbol name
        let symbolName = name + suffix;

        // Prepend the prefix to the symbol name
        if (prefix) {
            symbolName = prefix + symbolName;
        }

        // Append the suffix to the symbol name
        if (suffix) {
            symbolName += suffix;
        }

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
    getDocument() {
        return new SvgDocument(this.content);
    }

    /**
     * Gets the name of icon.
     * @returns {string}
     */
    getName() {
        return this.name;
    }

    /**
     * Generate URL to the icon symbol.
     * @param {string} [publicPath] - the public path from which the sprite will be served
     * @returns {string}
     */
    getUrlToSymbol(publicPath) {
        publicPath = publicPath ? publicPath.replace(/\/+$/, '') : '';

        return `${publicPath}/${this.sprite.resourcePath}#${this.symbolName}`;
    }
}

module.exports = SvgIcon;
