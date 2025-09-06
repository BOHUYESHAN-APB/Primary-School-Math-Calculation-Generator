module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  // ignore some config files that are not part of the TS project to avoid parser errors
  ignorePatterns: ['vite.config.ts', 'tailwind.config.ts', '*.config.*', 'dist/', 'node_modules/'],
  rules: {
    // keep rules minimal to avoid noise for now
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // relax explicit any to a warning to avoid blocking lint for many legacy files
    '@typescript-eslint/no-explicit-any': 'warn',
    // new react runtime makes 'react-in-jsx-scope' unnecessary
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // legacy switch-case lexical declarations are present in many files; allow for now and fix progressively
    'no-case-declarations': 'off',
  },
};