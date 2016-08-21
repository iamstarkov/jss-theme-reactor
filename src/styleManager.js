import warning from 'warning';
import prefixAll from 'inline-style-prefixer/static';
import { find } from './utils';

/**
 * styleManager module. Used to create styleManager objects.
 *
 * @module styleManager
 */

/**
 * Creates a new styleManager
 *
 * @example
 *
 * ```javascript
 * import { createStyleManager } from 'stylishly/styleManager';
 * const styleManager = createStyleManager();
 * ```
 *
 * @param  {Object}  config                    - Config
 * @param  {Object}  config.jss                - Jss instance
 * @param  {Object}  config.theme={}           - Theme object
 * @return {module:styleManager~styleManager}  - styleManager
 */
export function createStyleManager({ jss, theme = {} } = {}) {
  let sheetMap = [];

  /**
   * styleManager description
   *
   * @name styleManager
   * @type {Object}
   */
  const styleManager = {
    get sheetMap() { return sheetMap; },
    jss,
    reset,
    rerender,
    theme,
    render,
    getClasses,
    updateTheme,
    prepareInline,
  };

  function getClasses(styleSheet) {
    const mapping = find(sheetMap, { styleSheet });

    if (mapping) {
      return mapping.classes;
    }

    return undefined;
  }

  /**
   * Some mundane desc
   *
   * @memberOf module:styleManager~styleManager
   * @param  {Object} styleSheet - styleSheet object created by createStyleSheet()
   * @return {Object}            - classNames keyed by styleSheet property names
   */
  function render(styleSheet, ...other) {
    let mapping = find(sheetMap, { styleSheet });

    if (!mapping) {
      const { name, resolveStyles, options } = styleSheet;

      if (process.env.NODE_ENV !== 'production') {
        // hmr support
        const looseMapping = find(sheetMap, { name });

        if (looseMapping) {
          // console.log(looseMapping.styleSheet); // eslint-disable-line no-console
        }

        warning(
          !looseMapping,
          `A styleSheet with the name ${name} already exists.`
        );
      }

      const rules = resolveStyles(theme, ...other);
      const jssStyleSheet = jss.createStyleSheet(rules, { meta: name, ...options });
      const { classes } = jssStyleSheet.attach();

      mapping = { name, classes, styleSheet, jssStyleSheet, other };
      sheetMap.push(mapping);
    }

    return mapping.classes;
  }

  /**
   * Replace the current theme with a new theme
   *
   * @param  {Object}  newTheme    - New theme object
   * @param  {boolean} shouldReset - Set to true to rerender the renderer
   */
  function updateTheme(newTheme, shouldReset = true) {
    styleManager.theme = newTheme;
    if (shouldReset) {
      rerender();
    }
  }

  function reset() {
    sheetMap.forEach(({ jssStyleSheet }) => jssStyleSheet.detach());
    jss.sheets.registry = [];
    sheetMap = [];
  }

  /**
   * Reset and replace all existing stylesheets
   *
   * @memberOf module:styleManager~styleManager
   */
  function rerender() {
    const sheets = [...sheetMap];
    reset();
    sheets.forEach((n) => render(n.styleSheet, ...n.other));
  }

  function prepareInline(declaration) {
    if (typeof declaration === 'function') {
      declaration = declaration(theme);
    }

    return prefixAll(declaration);
  }

  return styleManager;
}
