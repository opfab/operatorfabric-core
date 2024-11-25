import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginJest from 'eslint-plugin-jest'

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,ts}']
    },
    pluginJs.configs.recommended,
    {plugins:{jest: pluginJest}},
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            'prefer-rest-params': 'off',
            'no-console': 'error',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/valid-expect': 'error',
            'jest/no-disabled-tests': 'warn',
            'jest/no-conditional-expect': 'error',
            'prefer-const': 'error',
            'eqeqeq': ['error','smart']
        }
    }
];

