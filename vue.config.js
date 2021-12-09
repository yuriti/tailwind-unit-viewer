'use strict';

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    publicPath: isDev ? '/' : '/tailwind-unit-viewer/'
};
