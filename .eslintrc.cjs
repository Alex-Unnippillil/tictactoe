module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "script",
  },
  overrides: [
    {
      files: ["tests/**/*.js"],
      env: {
        jest: true,
        node: true,
      },
    },
  ],
};
