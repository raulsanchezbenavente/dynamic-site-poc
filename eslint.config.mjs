import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/node_modules', '**/dist', '**/**.spec.ts', '**/**.d.ts', '**/**.css'],
  },
  // -------------------
  // .TS CONFIG
  // -------------------
  ...compat
    .extends(
      'plugin:@angular-eslint/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'prettier'
    )
    .map((config) => ({
      ...config,
      files: ['**/*.ts'],
    })),
  {
    files: ['**/*.ts'],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json', './tsconfig.app.json', './tsconfig.spec.json'],
        createDefaultProgram: true,
      },
    },

    plugins: {
      perfectionist,
    },

    rules: {
      // angular best practices
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/sort-lifecycle-methods': ['error'],

      // typescript
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          // type-like structures such as classes, interfaces, enums, and types
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase'],
        },
        {
          selector: 'classMethod',
          format: ['camelCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
      ],
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            accessors: 'off',
            constructors: 'no-public',
            methods: 'explicit',
            properties: 'explicit',
            parameterProperties: 'explicit',
          },
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'consistent-return': 'error',
      'no-unused-vars': 'error',
      'no-var': 'error',
      'object-curly-spacing': ['error', 'always'],
      'no-empty': 'error',

      // prevents spacing before the optional chaining operator (?.) for example
      'no-whitespace-before-property': 'error',

      // sort rules
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          groups: [
            ['builtin'], // Node.js built-in modules, e.g., fs, path
            ['external'], // Packages from node_modules, e.g., react, lodash
            ['internal'], // Internal modules, typically within your project
            ['parent'], // Parent directories, e.g., ../utils
            ['sibling'], // Sibling modules, e.g., ./helper
            ['index'], // Index files (./ or ../)
          ],
          order: 'asc', // Sort import groups in ascending alphabetical order
        },
      ],
      'perfectionist/sort-named-imports': ['error'],
      'perfectionist/sort-exports': ['error'],
      'perfectionist/sort-named-exports': ['error'],
    },
  },

  // -------------------
  // .HTML CONFIG
  // -------------------
  ...compat
    .extends('plugin:@angular-eslint/template/recommended', 'plugin:prettier/recommended', 'prettier')
    .map((config) => ({
      ...config,
      files: ['**/*.html'],
      rules: {
        'prettier/prettier': 'off',
        // Plugin rules: https://www.npmjs.com/package/@angular-eslint/eslint-plugin-template
        '@angular-eslint/template/alt-text': ['error'],
        '@angular-eslint/template/banana-in-box': ['error'],
        '@angular-eslint/template/click-events-have-key-events': ['error'],
        '@angular-eslint/template/interactive-supports-focus': ['error'],
        '@angular-eslint/template/label-has-associated-control': ['error'],
        '@angular-eslint/template/no-interpolation-in-attributes': ['error'],
        '@angular-eslint/template/no-duplicate-attributes': ['error'],
        '@angular-eslint/template/prefer-control-flow': ['warn'], // warning to use the new angular built-in control flow
        '@angular-eslint/template/role-has-required-aria': ['error'],
        '@angular-eslint/template/use-track-by-function': ['error'],
        '@angular-eslint/template/valid-aria': ['error'],
        '@angular-eslint/template/attributes-order': ['error'],
        '@angular-eslint/template/indent': 'off',
      },
    })),

  // -------------------
  // .STORIES.TS CONFIG
  // -------------------
  {
    files: ['**/stories/**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
        },
      ],

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
      ],
      // Prevents spacing before the optional chaining operator (?.) for example
      'no-whitespace-before-property': 'error',
    },
  },

  // -------------------
  // .SPECS.TS CONFIG
  // -------------------
  {
    files: ['**/*.spec.ts'],
    rules: {},
  },

  // -------------------
  // .MODULES.TS CONFIG
  // -------------------
  {
    files: ['**/*.module.ts'],
    rules: {},
  },

  // -------------------
  // .IMPORT RESOLVER CONFIG
  // -------------------
  {
    files: ['**/*.ts'],
    plugins: {
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json', './tsconfig.app.json'],
        },
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/order': 'off',
    },
  },
];
