'use strict';

const path = require('path');
const glob = require('glob');
const svgo = require('svgo');
const SvgStorePlugin = require('./lib/SvgStorePlugin');

const DEFAULT_OPTIONS = {
    directory: '/',
    name: 'images/sprite.svg',
    prefix: 'icon-',
    suffix: '',
    svgoOptions: {
        plugins: []
    }
};

function SvgStorePlugin(options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
}

SvgStorePlugin.prototype.apply = function (compiler) {
    compiler.plugin('emit', function(compilation, callback) {
        const svgFiles = glob(path.join(this.options.directory, '**/*.svg'), { nodir: true });

        svgFiles.forEach((file) => {

        });


        // Create a header string for the generated file:
        var filelist = 'In this build:\n\n';

        // Loop through all compiled assets,
        // adding a new line item for each filename.
        for (var filename in compilation.assets) {
            filelist += ('- '+ filename +'\n');
        }

        // Insert this list into the webpack build as a new file asset:
        compilation.assets[this.options.filename] =

        callback();
    });
};

module.exports = SvgStorePlugin;

/*
const loaderUtils = require('loader-utils');
const svgo = require('svgo');

const SvgStorePlugin = require('./lib/SvgStorePlugin');

/!**
 * Default values for every param that can be passed in the loader query.
 * @const
 * @type {Object}
 *!/
const DEFAULT_QUERY_VALUES = {
    name: 'img/sprite.svg',
    prefix: 'icon-',
    suffix: '',
    svgoOptions: {
        plugins: []
    }
};

/!**
 * Applies SVGO on the SVG file.
 * Registers the SVG on the Sprites store.
 * Generates SVG metadata to be passed to JavaScript and CSS files.
 * @param {Buffer} content - the content of the SVG file.
 *!/
function loader(content) {
    const { addDependency, cacheable, resourcePath, options: { output: { publicPath } } } = this;

    // Get callback because the SVG is going to be optimized and that is an async operation
    const callback = this.async();

    // Parse the loader query and apply the default values in case no values are provided
    const query = Object.assign({}, DEFAULT_QUERY_VALUES, loaderUtils.getOptions(this));

    const { svgoOptions, prefix, suffix } = query;

    // Add the icon as a dependency
    addDependency(resourcePath);

    // Set the loader as not cacheable
    cacheable(false);

    // Start optimizing the SVG file
    try {
        new svgo(svgoOptions).optimize(content, function (result) {
            // Register the sprite and icon
            const icon = SvgStorePlugin.getSprite(query.name).addIcon(resourcePath, result.data, { prefix, suffix });

            // Export the icon as a metadata object that contains urls to be used on an <img/> in HTML or url() in CSS
            callback(
                null,
                `module.exports = {
                    name: '${icon.getName()}',
                    symbol: '${icon.getUrlToSymbol(publicPath)}',
                    toString: function () {
                        return this.symbol;
                    }
                };`
            );
        });
    } catch (err) {
        callback(err);
    }
}

loader.raw = true;

module.exports = loader;
*/
