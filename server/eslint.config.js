import tseslint from 'typescript-eslint'

export default tseslint.config({
  files: ['src/**/*.ts'],
  extends: [...tseslint.configs.recommended],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-floating-promises': 'error',
    'no-console': ['warn', { allow: ['error', 'warn'] }],
  },
})
