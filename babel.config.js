module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'entry', // Or 'usage' if you want to only include the polyfills that are used
          corejs: 3, // Specify core-js version
        },
      ],
    ],
  };
  