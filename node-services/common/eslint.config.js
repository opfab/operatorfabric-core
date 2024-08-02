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
        "plugins": ["ban"],
        "rules": {
            "@typescript-eslint/consistent-type-imports": "off",
            // This rule is not necessary as we are using a transpiler with type checking
            // For more information
            // see https://typescript-eslint.io/blog/consistent-type-imports-and-exports-why-and-how
            "ban/ban": [
                2,
                {"name": ["describe", "only"], "message": "don't focus tests"},
                {"name": "fdescribe", "message": "don't focus tests"},
                {"name": ["it", "only"], "message": "don't focus tests"},
                {"name": "fit", "message": "don't focus tests"},
                {"name": ["test", "only"], "message": "don't focus tests"},
                {"name": "ftest", "message": "don't focus tests"}
            ]
        },
        "overrides": [
            {
                "files": ["*.ts"],
                "parserOptions": {
                    "project": ["tsconfig.json"],
                    "createDefaultProgram": true
                },
                "extends": [
                    "plugin:prettier/recommended"
                ],
                "rules": {
                    "eqeqeq": [2, "smart"],
                    "prefer-const": 2,
                    "no-trailing-spaces": "error",
                    "keyword-spacing": ["error"],
                    "no-console": ["error"]
                }
            }
        ]
    }
];