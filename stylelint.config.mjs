import customPlugin_SelectorClassPattern from './lintrules/stylelint/selector-class-pattern.mjs';
import customPlugin_CheckCalculateRem from './lintrules/stylelint/stylelint-plugin-check-calculate-rem.mjs';
import customPlugin_ValidatePrefixInterpolation from './lintrules/stylelint/validate-prefix-interpolation.mjs';

export default {
  defaultSeverity: 'warning',
  ignoreFiles: [
    '**/*.html',
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '**/*.md',
    '**/*.mdx',
    '**/*.mjs',
    '**/*.cjs',
    '**/*.json',
    '**/node_modules/**',
    '**/dist/**',
    '**/.angular/**',
    '**/coverage/**',
    '**/storybooks/**',
    '**/.storybook/**/*.ts',
    '**/.storybook/**/*.js',
    '**/.copilot/**',
    '**/scripts/**'
  ],
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-prettier/recommended'
  ],
  plugins: [
    customPlugin_SelectorClassPattern,
    customPlugin_CheckCalculateRem,
    customPlugin_ValidatePrefixInterpolation,
    'stylelint-scss',
    'stylelint-prettier',
  ],
  rules: {
    'alpha-value-notation': 'number',
    'color-function-notation': 'legacy',
    'color-hex-length': 'short',
    'color-named': 'never',
    'custom-property-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
      {
        message: 'Expected custom property name to be kebab-case.\nNo initial numbers allowed.',
      },
    ],
    'declaration-block-no-redundant-longhand-properties': [
      true,
      {
        // `inset` is a shorthand property in CSS that combines `top`, `right`, `bottom`, and `left`.
        // We are ignoring it for better cross-browser support, especially for older browsers.
        "ignoreShorthands": ["inset"]
      }
    ],
    'declaration-no-important': true,
    'declaration-property-unit-disallowed-list': [
      {
        'font-size': ['px'],
      },
      {
        message: 'Avoid using pixel units for font-size properties. Instead, use typography variables in rem units for better scalability and accessibility.\nAdditionally, avoid decimal pixel values like 10.5px, as pixels cannot be divided accurately.',
      }
    ],
    'declaration-property-value-disallowed-list': [
      {
        'outline': ['none'],
      },
      {
        message: 'Using disallowed property values. Ensure compliance with accessibility and project guidelines.\nSee details in file:./lintrules/stylelint/README.md, section "Disallowed Property Values".',
      }
    ],
    // use rule 'scss/at-function-pattern' instead.
    'function-name-case': null,
    'keyframes-name-pattern': ['^[a-zA-Z][a-zA-Z0-9]*$'],
    'max-nesting-depth': [
      3,
      // {
      //   ignore: ['blockless-at-rules', 'pseudo-classes'],
      // },
    ],
    'property-disallowed-list': [
      'grid-gap',
      {
        message: 'Use gap instead.',
      },
    ],
    'property-no-vendor-prefix': [
      true,
      {
        // Ignored properties are based on data from https://caniuse.com/. These properties should be reviewed annually.
        ignoreProperties: [
          'text-size-adjust',
          'font-smoothing',
          'osx-font-smoothing',
          'tap-highlight-color'
        ],
      },
    ],
    'rule-empty-line-before': [
      'never-multi-line',
      // {
      //   except: ['first-nested'],
      //   ignore: ['after-comment']
      // }
    ],
    // use 'custom/selector-class-pattern' instead.
    'selector-class-pattern': null,
    'selector-max-compound-selectors': 3,
    'selector-max-type': 1,
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['ng-deep'],
      },
    ],
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['animation', 'animation-name'],
      }
    ],

    // scss rules
    'scss/load-partial-extension': 'never',
    'scss/selector-no-redundant-nesting-selector': true,
    'scss/at-function-pattern': [
      '^[a-z]+[a-zA-Z0-9]*$',
      {
        message: 'The function name must follow camelCase format.',
      },
    ],

    // custom rules
    'custom/no-calculateRem-without-interpolation': true,
    'custom/selector-class-pattern': true,
    'custom/require-prefix-interpolation': true,
  },
  overrides: [
    {
      files: ["**/*.scss", "**/*.css"],
      customSyntax: "postcss-scss",
      rules: {},
    },
  ],
};
