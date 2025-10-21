import {defineConfig, globalIgnores} from 'eslint/config';
import jest from 'eslint-plugin-jest';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import js from '@eslint/js';
import {FlatCompat} from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
    globalIgnores(['projects/**/*']),
    {
        plugins: {
            jest
        },

        languageOptions: {
            globals: {
                ...jest.environments.globals.globals
            },

            ecmaVersion: 2020,
            sourceType: 'script'
        },

        rules: {
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error'
        }
    },
    {
        files: ['**/*.ts'],

        extends: compat.extends(
            'plugin:@angular-eslint/recommended',
            'plugin:@angular-eslint/template/process-inline-templates'
        ),

        languageOptions: {
            ecmaVersion: 5,
            sourceType: 'script',

            parserOptions: {
                project: ['tsconfig.json'],
                createDefaultProgram: true
            }
        },

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
        extends: compat.extends('plugin:@angular-eslint/template/recommended'),
        rules: {}
    }
]);
