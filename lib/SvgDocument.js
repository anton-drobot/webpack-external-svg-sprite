'use strict';

const cheerio = require('cheerio');

/**
 * SVG Document
 * - Generates SVG content.
 * - Parses the content of a SVG document.
 */
class SvgDocument {

    /**
     * Parses the given content.
     * @param {string} content - the content of a SVG file.
     */
    constructor(content) {
        const $ = cheerio.load(content, { normalizeWhitespace: true, xmlMode: true });

        this.$svg = $('svg');
    }

    /**
     * Creates an SVG document with the given contents.
     * @param {...string} contents - contents to be included in the document.
     * @returns {string}
     */
    static create(...contents) {
        return `<svg xmlns="http://www.w3.org/2000/svg">${contents.join('')}</svg>`;
    }

    /**
     * Creates a <defs/> element with the given contents.
     * @param {...string} contents - contents to be included in the element.
     * @returns {string}
     */
    static createDefs(...contents) {
        return `<defs>${contents.join('')}</defs>`;
    }

    /**
     * Creates a <symbol/> element with the given contents.
     * @param {string[]} attrs - attributes to be included in the element.
     * @param {..string} contents - contents to be included in the element.
     * @returns {string}
     */
    static createSymbol(attrs = [], ...contents) {
        return `<symbol ${attrs.join(' ')}>${contents.join('')}</symbol>`;
    }

    /**
     * Gets the value of the attribute with the given name.
     * @param {string} name - the name of the attribute.
     * @returns {string}
     */
    getAttribute(name) {
        const $svg = this.$svg;
        return $svg.attr(name) || $svg.attr(name.toLowerCase());
    }

    /**
     * Gets the value of the viewBox attribute.
     * @returns {string}
     */
    getViewBox() {
        return this.getAttribute('viewBox');
    }

    /**
     * Converts a SVG document into a <symbol/> element.
     * @param {string} id - the symbol id.
     * @returns {string}
     */
    toSymbol(id) {
        const $svg = this.$svg;
        const attrs = [
            `id="${id}"`
        ];

        ['class', 'preserveAspectRatio', 'viewBox'].forEach((name) => {
            let value = this.getAttribute(name);

            if (value) {
                attrs.push(`${name}="${value}"`);
            }
        });

        return SvgDocument.createSymbol(attrs, $svg.html());
    }
}

module.exports = SvgDocument;
