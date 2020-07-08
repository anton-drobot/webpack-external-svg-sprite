'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var svgo = require('svgo');
var Chunk = require('webpack/lib/Chunk');
var OriginalSource = require('webpack-sources/lib/OriginalSource');

var SvgSprite = require('./lib/SvgSprite');

var ExtractedModule = void 0;

try {
    ExtractedModule = require('extract-text-webpack-plugin/ExtractedModule');
} catch (e) {
    ExtractedModule = null;
}

var DEFAULT_OPTIONS = {
    emit: true,
    directory: '/',
    name: 'images/sprite.svg',
    prefix: 'icon-',
    suffix: '',
    svgoOptions: {
        plugins: []
    }
};

/**
 * Stores the sprites to be generated and the icons to be included on each one.
 * @memberOf SvgStorePlugin
 * @private
 * @static
 * @type {Record<string, SvgSprite>}
 */
var store = {};

/**
 * SVG Store Plugin
 * - Manages all sprites data
 * - Generates the sprites during optimization time
 * - Plugin for webpack
 */

var SvgStorePlugin = function () {

    /**
     * Initializes options.
     * @param {Partial<typeof DEFAULT_OPTIONS>} options
     */
    function SvgStorePlugin() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, SvgStorePlugin);

        this.pluginName = this.constructor.name;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    /**
     * Gets the sprite instance for the given path or if it doesn't exist creates a new one.
     * @param {string} resourcePath - the relative path for the sprite based on the output folder.
     * @returns {SvgSprite}
     */


    _createClass(SvgStorePlugin, [{
        key: 'apply',


        /**
         * - Generates every registered sprite during optimization phase.
         * - Replaces the sprite URL with the hashed URL during modules optimization phase.
         * - Performs the previous step also for extracted chuncks (ExtractTextPlugin)
         * - Adds the sprites to the compilation assets during the additional assets phase.
         * @param {import("webpack").Compiler} compiler
         */
        value: function apply(compiler) {
            var _this = this;

            // Get compilation instance
            compiler.hooks.thisCompilation.tap(this.pluginName, function (compilation) {
                var svgFiles = glob.sync(path.join(_this.options.directory, '**/*.svg'), { nodir: true });
                var sprite = SvgStorePlugin.getSprite(_this.options.name);

                svgFiles.forEach(function (file) {
                    var content = fs.readFileSync(file);

                    new svgo(_this.options.svgoOptions).optimize(content, function (result) {
                        // Register the sprite and icon
                        sprite.addIcon(file, result.data, { prefix: _this.options.prefix, suffix: _this.options.suffix });
                    });
                });

                // Generate sprites during the optimization phase
                compilation.hooks.optimize.tap(_this.pluginName, function () {

                    // For every sprite
                    for (var spritePath in store) {
                        if (store.hasOwnProperty(spritePath)) {

                            // Generate sprite content
                            store[spritePath].generate();
                        }
                    }
                });

                // Replace the sprites URL with the hashed URL during the modules optimization phase
                compilation.hooks.optimizeModules.tap(_this.pluginName, function (modules) {

                    // Get sprites with interpolated name
                    var spritesWithInterpolatedName = _this.getSpritesWithInterpolateName();

                    if (spritesWithInterpolatedName.length > 0) {

                        // Find icons modules
                        modules.forEach(function (module) {
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = spritesWithInterpolatedName[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var _sprite = _step.value;
                                    var icons = _sprite.icons;

                                    // If the module corresponds to one of the icons of this sprite

                                    if (module.resource in icons) {
                                        _this.replaceSpritePathInModuleSource(module, _sprite);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError = true;
                                _iteratorError = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion && _iterator.return) {
                                        _iterator.return();
                                    }
                                } finally {
                                    if (_didIteratorError) {
                                        throw _iteratorError;
                                    }
                                }
                            }
                        });
                    }
                });

                // Replace the sprites URL with the hashed URL during the extracted chunks optimization phase
                compilation.hooks.optimizeExtractedChunks.tap(_this.pluginName, function (chunks) {

                    // Get sprites with interpolated name
                    var spritesWithInterpolatedName = _this.getSpritesWithInterpolateName();

                    if (spritesWithInterpolatedName.length > 0) {
                        chunks.forEach(function (chunk) {
                            chunk.modules.forEach(function (module) {
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = spritesWithInterpolatedName[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var _sprite2 = _step2.value;

                                        if (module instanceof ExtractedModule) {
                                            _this.replaceSpritePathInModuleSource(module, _sprite2);
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError2 = true;
                                    _iteratorError2 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                            _iterator2.return();
                                        }
                                    } finally {
                                        if (_didIteratorError2) {
                                            throw _iteratorError2;
                                        }
                                    }
                                }
                            });
                        });
                    }
                });

                // Add sprites to the compilation assets
                if (_this.options.emit) {
                    compilation.hooks.additionalAssets.tapAsync(_this.pluginName, function (callback) {

                        // For every sprite
                        for (var spritePath in store) {
                            if (store.hasOwnProperty(spritePath)) {
                                (function () {

                                    // Get sprite
                                    var _store$spritePath = store[spritePath],
                                        name = _store$spritePath.name,
                                        resourcePath = _store$spritePath.resourcePath,
                                        content = _store$spritePath.content;

                                    // Create a chunk for the sprite

                                    var chunk = new Chunk(name);
                                    chunk.ids = [];
                                    chunk.files.push(resourcePath);

                                    // Add the sprite to the compilation assets
                                    compilation.assets[resourcePath] = {
                                        source: function source() {
                                            return content;
                                        },
                                        size: function size() {
                                            return content.length;
                                        }
                                    };

                                    // Add chunk to the compilation
                                    // NOTE: This step is only to allow other plugins to detect the existence of this asset
                                    compilation.chunks.push(chunk);
                                })();
                            }
                        }

                        callback();
                    });
                }
            });
        }

        /**
         * Gets sprites which name has an hash.
         * @returns {SvgSprite[]}
         */

    }, {
        key: 'getSpritesWithInterpolateName',
        value: function getSpritesWithInterpolateName() {
            var spritesWithInterpolatedName = [];

            for (var spritePath in store) {
                if (store.hasOwnProperty(spritePath)) {
                    var sprite = store[spritePath];
                    var originalPath = sprite.originalPath,
                        resourcePath = sprite.resourcePath;


                    if (originalPath !== resourcePath) {
                        spritesWithInterpolatedName.push(sprite);
                    }
                }
            }

            return spritesWithInterpolatedName;
        }

        /**
         * Replaces the given sprite URL with the hashed URL in the given module source.
         * @param {Module} module - the module where the URL needs to be replaced.
         * @param {SvgSprite} sprite - the sprite for the module.
         */

    }, {
        key: 'replaceSpritePathInModuleSource',
        value: function replaceSpritePathInModuleSource(module, sprite) {
            var originalPathRegExp = sprite.originalPathRegExp,
                resourcePath = sprite.resourcePath;


            var source = module._source;

            if (typeof source === 'string') {
                module._source = source.replace(originalPathRegExp, resourcePath);
            } else if (source instanceof OriginalSource) {
                source._name = source._name.replace(originalPathRegExp, resourcePath);
                source._value = source._value.replace(originalPathRegExp, resourcePath);
            }
        }
    }], [{
        key: 'getSprite',
        value: function getSprite(resourcePath) {
            if (!(resourcePath in store)) {
                store[resourcePath] = new SvgSprite(resourcePath);
            }

            return store[resourcePath];
        }
    }]);

    return SvgStorePlugin;
}();

module.exports = SvgStorePlugin;