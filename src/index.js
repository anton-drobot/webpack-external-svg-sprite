const fs = require('fs');
const path = require('path');
const glob = require('glob');
const svgo = require('svgo');
const Chunk = require('webpack/lib/Chunk');
const OriginalSource = require('webpack-sources/lib/OriginalSource');

const SvgSprite = require('./lib/SvgSprite');

let ExtractedModule;

try {
    ExtractedModule = require('extract-text-webpack-plugin/ExtractedModule');
} catch (e) {
    ExtractedModule = null;
}

const DEFAULT_OPTIONS = {
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
let store = {};

/**
 * SVG Store Plugin
 * - Manages all sprites data
 * - Generates the sprites during optimization time
 * - Plugin for webpack
 */
class SvgStorePlugin {

    /**
     * Initializes options.
     * @param {Partial<typeof DEFAULT_OPTIONS>} options
     */
    constructor(options = {}) {
        this.pluginName = this.constructor.name;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    /**
     * Gets the sprite instance for the given path or if it doesn't exist creates a new one.
     * @param {string} resourcePath - the relative path for the sprite based on the output folder.
     * @returns {SvgSprite}
     */
    static getSprite(resourcePath) {
        if (!(resourcePath in store)) {
            store[resourcePath] = new SvgSprite(resourcePath);
        }

        return store[resourcePath];
    }

    /**
     * - Generates every registered sprite during optimization phase.
     * - Replaces the sprite URL with the hashed URL during modules optimization phase.
     * - Performs the previous step also for extracted chuncks (ExtractTextPlugin)
     * - Adds the sprites to the compilation assets during the additional assets phase.
     * @param {import("webpack").Compiler} compiler
     */
    apply(compiler) {
        // Get compilation instance
        compiler.hooks.thisCompilation.tap(this.pluginName, (compilation) => {
            const svgFiles = glob.sync(path.join(this.options.directory, '**/*.svg'), { nodir: true });
            const sprite = SvgStorePlugin.getSprite(this.options.name);

            svgFiles.forEach((file) => {
                const content = fs.readFileSync(file);

                new svgo(this.options.svgoOptions).optimize(content, (result) => {
                    // Register the sprite and icon
                    sprite.addIcon(file, result.data, { prefix: this.options.prefix, suffix: this.options.suffix });
                });
            });

            // Generate sprites during the optimization phase
            compilation.hooks.optimize.tap(this.pluginName, () => {

                // For every sprite
                for (const spritePath in store) {
                    if (store.hasOwnProperty(spritePath)) {

                        // Generate sprite content
                        store[spritePath].generate();
                    }
                }
            });

            // Replace the sprites URL with the hashed URL during the modules optimization phase
            compilation.hooks.optimizeModules.tap(this.pluginName, (modules) => {

                // Get sprites with interpolated name
                const spritesWithInterpolatedName = this.getSpritesWithInterpolateName();

                if (spritesWithInterpolatedName.length > 0) {

                    // Find icons modules
                    modules.forEach((module) => {
                        for (const sprite of spritesWithInterpolatedName) {
                            const { icons } = sprite;

                            // If the module corresponds to one of the icons of this sprite
                            if (module.resource in icons) {
                                this.replaceSpritePathInModuleSource(module, sprite);
                            }
                        }
                    });
                }
            });

            // Replace the sprites URL with the hashed URL during the extracted chunks optimization phase
            compilation.hooks.optimizeExtractedChunks.tap(this.pluginName, (chunks) => {

                // Get sprites with interpolated name
                const spritesWithInterpolatedName = this.getSpritesWithInterpolateName();

                if (spritesWithInterpolatedName.length > 0) {
                    chunks.forEach((chunk) => {
                        chunk.modules.forEach((module) => {
                            for (const sprite of spritesWithInterpolatedName) {
                                if (module instanceof ExtractedModule) {
                                    this.replaceSpritePathInModuleSource(module, sprite);
                                }
                            }
                        });
                    });
                }
            });

            // Add sprites to the compilation assets
            if (this.options.emit) {
                compilation.hooks.additionalAssets.tapAsync(this.pluginName, (callback) => {

                    // For every sprite
                    for (const spritePath in store) {
                        if (store.hasOwnProperty(spritePath)) {

                            // Get sprite
                            const { name, resourcePath, content } = store[spritePath];

                            // Create a chunk for the sprite
                            const chunk = new Chunk(name);
                            chunk.ids = [];
                            chunk.files.push(resourcePath);

                            // Add the sprite to the compilation assets
                            compilation.assets[resourcePath] = {
                                source() {
                                    return content;
                                },
                                size() {
                                    return content.length;
                                }
                            };

                            // Add chunk to the compilation
                            // NOTE: This step is only to allow other plugins to detect the existence of this asset
                            compilation.chunks.push(chunk);
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
    getSpritesWithInterpolateName() {
        const spritesWithInterpolatedName = [];

        for (const spritePath in store) {
            if (store.hasOwnProperty(spritePath)) {
                const sprite = store[spritePath];
                const { originalPath, resourcePath } = sprite;

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
    replaceSpritePathInModuleSource(module, sprite) {
        const { originalPathRegExp, resourcePath } = sprite;

        const source = module._source;

        if (typeof source === 'string') {
            module._source = source.replace(originalPathRegExp, resourcePath);
        } else if (source instanceof OriginalSource) {
            source._name = source._name.replace(originalPathRegExp, resourcePath);
            source._value = source._value.replace(originalPathRegExp, resourcePath);
        }
    }
}

module.exports = SvgStorePlugin;
