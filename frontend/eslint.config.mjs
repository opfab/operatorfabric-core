import {defineConfig, globalIgnores} from 'eslint/config';
import jest from 'eslint-plugin-jest';
import angular from 'angular-eslint';

export default defineConfig([
    globalIgnores(['projects/**/*']),
    {
        plugins: {
            jest
        },

        languageOptions: {
            globals: {
                ...jest.environments.globals.globals
            }
        },

        rules: {
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error'
        }
    },
    {
        files: ['**/*.ts'],

        extends: [...angular.configs.tsRecommended],
        processor: angular.processInlineTemplates,

        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'of',
                    style: 'camelCase'
                }
            ],

            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'of',
                    style: 'kebab-case'
                }
            ],

            eqeqeq: [2, 'smart'],
            'prefer-const': 2,
            'no-console': ['error']
        }
    },
    {
        files: ['**/*.html'],
        extends: [...angular.configs.templateRecommended],
        rules: {}
    }
]);
