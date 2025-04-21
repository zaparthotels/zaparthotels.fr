import StyleDictionary from 'style-dictionary';
import { logVerbosityLevels, logWarningLevels } from 'style-dictionary/enums';
import { THEMES } from './constant.js';

StyleDictionary.registerTransform({
  name: 'attribute/omit-description',
  type: 'attribute',
  transform: (token) => {
    token.$description = '';
    return token;
  },
});

StyleDictionary.registerTransform({
  name: 'name/strip-collection',
  type: 'name',
  transform: (token) => {
    return token.path
      .slice(1)
      .map((part) => part.replace(/\s+/g, '-'))
      .join('-')
      .toLowerCase();
  },
});

StyleDictionary.registerTransform({
  name: 'value/string',
  type: 'value',
  transform: (token) => {
    if (token.$type === 'string' && /\s/.test(token.$value)) {
      return `"${token.$value}"`;
    }

    return token.$value;
  },
});

StyleDictionary.registerTransformGroup({
  name: 'custom/css',
  transforms: [
    'attribute/cti',
    'name/kebab',
    'time/seconds',
    'html/icon',
    'size/pxToRem',
    'color/css',
    'asset/url',
    'fontFamily/css',
    'cubicBezier/css',
    'strokeStyle/css/shorthand',
    'border/css/shorthand',
    'typography/css/shorthand',
    'transition/css/shorthand',
    'shadow/css/shorthand',
    'name/strip-collection',
    'value/string',
    'attribute/omit-description',
  ],
});

THEMES.map((theme) => {
  const fileName = () => {
    if (theme === 'default') {
      return 'tokens.css';
    }

    return `tokens-theme-${theme.toLowerCase()}.css`;
  };

  const selector = () => {
    if (theme === 'default') {
      return ':root';
    }

    return `[data-theme="${theme.toLowerCase()}"]`;
  };

  const transforms = () => {
    if (theme === 'default') {
      return [];
    }

    return ['value/use-mode'];
  };

  StyleDictionary.registerTransform({
    name: 'value/use-mode',
    type: 'value',
    transform: (token) => {
      if (token.$extensions?.mode?.[theme]) {
        return token.$extensions?.mode?.[theme];
      }

      return token.$value;
    },
  });

  new StyleDictionary({
    source: ['tokens/design-tokens.tokens.json'],
    log: {
      // warnings: logWarningLevels.disabled,
      // verbosity: logVerbosityLevels.verbose,
    },
    platforms: {
      css: {
        transformGroup: 'custom/css',
        transforms: transforms(),
        buildPath: '../../apps/frontend/src/styles/',
        options: {
          outputReferences: true,
          selector: selector(),
        },
        files: [
          {
            destination: fileName(),
            format: 'css/variables',
            filter: (token) => {
              if (theme === 'default') {
                return true;
              }

              return token.$extensions?.mode?.[theme];
            },
          },
        ],
      },
    },
  }).buildAllPlatforms();
});
