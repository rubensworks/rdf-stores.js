module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname, // this is the reason this is a .js file
        project: ['./tsconfig.eslint.json'],
    },
    extends: [
        '@rubensworks'
    ],
    rules: {
        'no-implicit-coercion': 'off',
        '@typescript-eslint/no-extra-parens': 'off',
        'unicorn/no-for-loop': 'off',
        'no-bitwise': 'off',
        'unicorn/no-nested-ternary': 'off',
    }
};
