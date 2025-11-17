module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-unsafe-innerhtml': 'error',
    
    // Code quality
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
    
    // Style (handled by Prettier, but keep some)
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'never']
  },
  globals: {
    // Browser globals
    'document': 'readonly',
    'window': 'readonly',
    'navigator': 'readonly',
    'localStorage': 'readonly',
    'sessionStorage': 'readonly',
    'fetch': 'readonly',
    'FormData': 'readonly',
    'FileReader': 'readonly',
    
    // Node globals
    'process': 'readonly',
    'require': 'readonly',
    'module': 'readonly',
    'exports': 'readonly',
    '__dirname': 'readonly',
    '__filename': 'readonly'
  },
  overrides: [
    {
      files: ['backend/**/*.js'],
      env: {
        node: true,
        browser: false
      }
    },
    {
      files: ['*.html'],
      plugins: ['html'],
      env: {
        browser: true
      }
    }
  ]
};

