import love from 'eslint-config-love';
import prettier from 'eslint-config-prettier';

export default [
    love,
    prettier,
    {
        files: ['**/*.js', '**/*.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                es2021: true,
                node: true
            }
        },
        rules: {
            // This rule is not necessary as we are using a transpiler with type checking
            // For more information
            // see https://typescript-eslint.io/blog/consistent-type-imports-and-exports-why-and-how
            '@typescript-eslint/consistent-type-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/class-methods-use-this': 'off',
            '@typescript-eslint/init-declarations': 'off',
            '@typescript-eslint/no-loop-func': 'off'
        }
    },
    {
        files: ['*.ts'],
        languageOptions: {
            parserOptions: {
                project: ['tsconfig.json'],
                createDefaultProgram: true
            }
        },
        rules: {
            eqeqeq: ['error', 'smart'],
            'prefer-const': 'error',
            'no-trailing-spaces': 'error',
            'keyword-spacing': 'error',
            'no-console': 'error'
        }
    }
];
