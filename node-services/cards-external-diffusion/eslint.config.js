module.exports = [
    {
        "env": {
            "es2021": true,
            "node": true
        },
        "extends": ["love", "plugin:prettier/recommended"],
        "parserOptions": {
            "ecmaVersion": "latest",
            "sourceType": "module"
        },

        "ignorePatterns": ["src/common/**/*"],
        "rules": {
            "@typescript-eslint/consistent-type-imports": "off"
            // This rules is not necessary as we are using a transpiler with type checking
            // For more information
            // see https://typescript-eslint.io/blog/consistent-type-imports-and-exports-why-and-how
        }
    }
];