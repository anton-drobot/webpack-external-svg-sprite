# Webpack External Svg Sprite

A plugin for webpack that converts all your SVGs into symbols and merges them into a SVG sprite.

## Requirements

You will need NodeJS v6+, npm v3+ and webpack 2.

To make it work in older browsers, like Internet Explorer, you will also need [SVG for Everybody](https://github.com/jonathantneal/svg4everybody) or [svgxuse](https://github.com/Keyamoon/svgxuse).

## Installation

```bash
npm i https://github.com/anton-drobot/webpack-external-svg-sprite.git --save-dev
```

## Plugin Options

- `emit` - determines if the sprite is supposed to be emitted (default: true). Useful when generating server rendering bundles where you just need the SVG sprite URLs but not the sprite itself.
- `directory` - folder where the files will be searched (required).
- `name` - relative path to the sprite file (default: `images/sprite.svg`). The `[hash]` placeholder is supported.
- `prefix` - value to be prefixed to the icons name (default: `icon-`).
- `suffix` - value to be suffixed to the icons name (default: ``).
- `svgoOptions` - custom options to be passed to svgo.

## Usage

If you have the following webpack configuration:

```js
// webpack.config.js

import path from 'path';
import SvgStorePlugin from 'webpack-external-svg-sprite';

module.exports = {
    output: {
        path: path.resolve(__dirname, 'public'),
        publicPath: '/',
    },
    plugins: [
        new SvgStorePlugin({
            emit: true,
            directory: path.resolve(__dirname, 'app'),
            name: 'images/sprite.svg',
            prefix: 'icon-',
            suffix: '',
            svgoOptions: {
                plugins: []
            }
        }),
    ],
};
```

Plugin will search SVG giles in `app` directory recursively and SVG sprite will be saved in `public/images/sprite.svg`.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
