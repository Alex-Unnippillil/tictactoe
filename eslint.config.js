module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**']
  },
  {
    files: ['site/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly'
      }
    },
    rules: {
      semi: ['error', 'always'],
      'no-unused-vars': 'warn',
      eqeqeq: 'warn',
      curly: ['error', 'all']
    }
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly'
      }
    },
    rules: {
      semi: ['error', 'always'],
      'no-unused-vars': 'warn',
      eqeqeq: 'warn',
      curly: ['error', 'all']
    }
  }
];
