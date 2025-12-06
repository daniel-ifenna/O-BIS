export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: { ecmaVersion: 2020, sourceType: "module" },
    rules: {}
  },
  {
    ignores: [
      "**/*.ts",
      "**/*.tsx",
      "node_modules/",
      ".next/",
      "dist/",
      "build/"
    ]
  }
]
