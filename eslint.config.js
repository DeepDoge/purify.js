import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config([
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.browser } },
    ...tseslint.configs.recommended,

    /*  {
        rules: {
            "no-namespace": "off",
            "prefer-const": "off",
            "no-this-alias": "off",
        },
    }, */
])
