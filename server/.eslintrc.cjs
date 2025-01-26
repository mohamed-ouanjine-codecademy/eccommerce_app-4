// server/.eslintrc.cjs
module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true // Add Jest environment
  },
  plugins: ['jest'], // Add Jest plugin
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended' // Add Jest recommended rules
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn'
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      env: {
        'jest/globals': true
      }
    }
  ]
};