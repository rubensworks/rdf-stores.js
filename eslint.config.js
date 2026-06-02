const config = require('@rubensworks/eslint-config');

module.exports = config([
  {
    ignores: [
      '**/*.js',
      '**/*.d.ts',
      '**/*.js.map',
      '**/*.json',
      '**/*.md',
      '**/*.yml',
      '**/*.yaml',
      'coverage/**',
      'node_modules/**',
    ],
  },
  {
    files: [ '**/*.ts' ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ './tsconfig.eslint.json' ],
      },
    },
  },
  {
    rules: {
      'no-implicit-coercion': 'off',
      'unicorn/no-for-loop': 'off',
      'no-bitwise': 'off',
      'unicorn/no-nested-ternary': 'off',
      'import/no-nodejs-modules': 'off',
    },
  },
  {
    files: [ 'perf/**/*.ts' ],
    rules: {
      'unicorn/filename-case': 'off',
      'no-sync': 'off',
    },
  },
]);
