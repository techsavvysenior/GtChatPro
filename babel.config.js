module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      '@babel/plugin-transform-private-methods',
      '@babel/plugin-transform-class-properties',
      '@babel/plugin-transform-private-property-in-object',
    ],
    // Ensure that all class-properties and private-methods are in 'loose' mode
    overrides: [
      {
        test: ['./node_modules/react-native/'],
        plugins: [
          [
            '@babel/plugin-transform-class-properties',
            { loose: true },
          ],
          [
            '@babel/plugin-transform-private-methods',
            { loose: true },
          ],
          [
            '@babel/plugin-transform-private-property-in-object',
            { loose: true },
          ],
        ],
      },
    ],
  };
  