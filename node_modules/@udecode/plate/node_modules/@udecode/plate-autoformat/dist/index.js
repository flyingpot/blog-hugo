'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');
var slate = require('slate');

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray_1 = isArray;

/**
 * Casts `value` as an array if it's not one.
 *
 * @static
 * @memberOf _
 * @since 4.4.0
 * @category Lang
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast array.
 * @example
 *
 * _.castArray(1);
 * // => [1]
 *
 * _.castArray({ 'a': 1 });
 * // => [{ 'a': 1 }]
 *
 * _.castArray('abc');
 * // => ['abc']
 *
 * _.castArray(null);
 * // => [null]
 *
 * _.castArray(undefined);
 * // => [undefined]
 *
 * _.castArray();
 * // => []
 *
 * var array = [1, 2, 3];
 * console.log(_.castArray(array) === array);
 * // => true
 */
function castArray() {
  if (!arguments.length) {
    return [];
  }
  var value = arguments[0];
  return isArray_1(value) ? value : [value];
}

var castArray_1 = castArray;

const getMatchRange = ({
  match,
  trigger
}) => {
  let start;
  let end;

  if (typeof match === 'object') {
    start = match.start;
    end = match.end;
  } else {
    start = match;
    end = start.split('').reverse().join('');
  }

  const triggers = trigger ? castArray_1(trigger) : [end.slice(-1)];
  end = trigger ? end : end.slice(0, -1);
  return {
    start,
    end,
    triggers
  };
};

const autoformatBlock = (editor, {
  text,
  trigger,
  match: _match,
  type = plateCommon.ELEMENT_DEFAULT,
  allowSameTypeAbove = false,
  preFormat,
  format,
  triggerAtBlockStart = true
}) => {
  const matches = castArray_1(_match);

  for (const match of matches) {
    const {
      end,
      triggers
    } = getMatchRange({
      match: {
        start: '',
        end: match
      },
      trigger
    });
    if (!triggers.includes(text)) continue;
    let matchRange;

    if (triggerAtBlockStart) {
      matchRange = plateCommon.getRangeFromBlockStart(editor); // Don't autoformat if there is void nodes.

      const hasVoidNode = plateCommon.someNode(editor, {
        at: matchRange,
        match: n => slate.Editor.isVoid(editor, n)
      });
      if (hasVoidNode) continue;
      const textFromBlockStart = plateCommon.getText(editor, matchRange);
      if (end !== textFromBlockStart) continue;
    } else {
      matchRange = plateCommon.getRangeBefore(editor, editor.selection, {
        matchString: end
      });
      if (!matchRange) continue;
    }

    if (!allowSameTypeAbove) {
      // Don't autoformat if already in a block of the same type.
      const isBelowSameBlockType = plateCommon.someNode(editor, {
        match: {
          type
        }
      });
      if (isBelowSameBlockType) continue;
    }

    slate.Transforms.delete(editor, {
      at: matchRange
    });
    preFormat === null || preFormat === void 0 ? void 0 : preFormat(editor);

    if (!format) {
      plateCommon.setNodes(editor, {
        type
      }, {
        match: n => slate.Editor.isBlock(editor, n)
      });
    } else {
      format(editor);
    }

    return true;
  }

  return false;
};

const isPreviousCharacterEmpty = (editor, at) => {
  const range = plateCommon.getRangeBefore(editor, at);

  if (range) {
    const text = plateCommon.getText(editor, range);

    if (text) {
      const noWhiteSpaceRegex = new RegExp(`\\S+`);
      return !text.match(noWhiteSpaceRegex);
    }
  }

  return true;
};

const getMatchPoints = (editor, {
  start,
  end
}) => {
  const selection = editor.selection;
  let beforeEndMatchPoint = selection.anchor;

  if (end) {
    beforeEndMatchPoint = plateCommon.getPointBefore(editor, selection, {
      matchString: end
    });
    if (!beforeEndMatchPoint) return;
  }

  let afterStartMatchPoint;
  let beforeStartMatchPoint;

  if (start) {
    afterStartMatchPoint = plateCommon.getPointBefore(editor, beforeEndMatchPoint, {
      matchString: start,
      skipInvalid: true,
      afterMatch: true
    });
    if (!afterStartMatchPoint) return;
    beforeStartMatchPoint = plateCommon.getPointBefore(editor, beforeEndMatchPoint, {
      matchString: start,
      skipInvalid: true
    });
    if (!isPreviousCharacterEmpty(editor, beforeStartMatchPoint)) return;
  }

  return {
    afterStartMatchPoint,
    beforeStartMatchPoint,
    beforeEndMatchPoint
  };
};

const autoformatMark = (editor, {
  type,
  text,
  trigger,
  match: _match,
  ignoreTrim
}) => {
  if (!type) return false;
  const selection = editor.selection;
  const matches = castArray_1(_match);

  for (const match of matches) {
    const {
      start,
      end,
      triggers
    } = getMatchRange({
      match,
      trigger
    });
    if (!triggers.includes(text)) continue;
    const matched = getMatchPoints(editor, {
      start,
      end
    });
    if (!matched) continue;
    const {
      afterStartMatchPoint,
      beforeEndMatchPoint,
      beforeStartMatchPoint
    } = matched;
    const matchRange = {
      anchor: afterStartMatchPoint,
      focus: beforeEndMatchPoint
    };

    if (!ignoreTrim) {
      const matchText = plateCommon.getText(editor, matchRange);
      if (matchText.trim() !== matchText) continue;
    } // delete end match


    if (end) {
      slate.Transforms.delete(editor, {
        at: {
          anchor: beforeEndMatchPoint,
          focus: selection.anchor
        }
      });
    }

    const marks = castArray_1(type); // add mark to the text between the matches

    slate.Transforms.select(editor, matchRange);
    marks.forEach(mark => {
      editor.addMark(mark, true);
    });
    slate.Transforms.collapse(editor, {
      edge: 'end'
    });
    plateCommon.removeMark(editor, {
      key: marks,
      shouldChange: false
    });
    slate.Transforms.delete(editor, {
      at: {
        anchor: beforeStartMatchPoint,
        focus: afterStartMatchPoint
      }
    });
    return true;
  }

  return false;
};

const autoformatText = (editor, {
  text,
  match: _match,
  trigger,
  format
}) => {
  const selection = editor.selection;
  const matches = castArray_1(_match); // dup

  for (const match of matches) {
    const {
      start,
      end,
      triggers
    } = getMatchRange({
      match: Array.isArray(format) ? match : {
        start: '',
        end: match
      },
      trigger
    });
    if (!triggers.includes(text)) continue;
    const matched = getMatchPoints(editor, {
      start,
      end
    });
    if (!matched) continue;
    const {
      afterStartMatchPoint,
      beforeEndMatchPoint,
      beforeStartMatchPoint
    } = matched;

    if (end) {
      slate.Transforms.delete(editor, {
        at: {
          anchor: beforeEndMatchPoint,
          focus: selection.anchor
        }
      });
    }

    if (typeof format === 'function') {
      format(editor, matched);
    } else {
      const formatEnd = Array.isArray(format) ? format[1] : format;
      editor.insertText(formatEnd);

      if (beforeStartMatchPoint) {
        const formatStart = Array.isArray(format) ? format[0] : format;
        slate.Transforms.delete(editor, {
          at: {
            anchor: beforeStartMatchPoint,
            focus: afterStartMatchPoint
          }
        });
        slate.Transforms.insertText(editor, formatStart, {
          at: beforeStartMatchPoint
        });
      }
    }

    return true;
  }

  return false;
};

/**
 * Enables support for autoformatting actions.
 * Once a match rule is validated, it does not check the following rules.
 */
const withAutoformat = ({
  rules
}) => editor => {
  const {
    insertText
  } = editor;

  editor.insertText = text => {
    if (!plateCommon.isCollapsed(editor.selection)) return insertText(text);

    for (const rule of rules) {
      var _autoformatter$mode;

      const {
        mode = 'text',
        insertTrigger,
        query
      } = rule;
      if (query && !query(editor, { ...rule,
        text
      })) continue;
      const autoformatter = {
        block: autoformatBlock,
        mark: autoformatMark,
        text: autoformatText
      };

      if ((_autoformatter$mode = autoformatter[mode]) !== null && _autoformatter$mode !== void 0 && _autoformatter$mode.call(autoformatter, editor, { ...rule,
        text
      })) {
        return insertTrigger && insertText(text);
      }
    }

    insertText(text);
  };

  return editor;
};
/**
 * @see {@link withAutoformat}
 */

const createAutoformatPlugin = plateCore.getPlatePluginWithOverrides(withAutoformat);

const autoformatArrow = [{
  mode: 'text',
  match: '->',
  format: '→'
}, {
  mode: 'text',
  match: '<-',
  format: '←'
}, {
  mode: 'text',
  match: '=>',
  format: '⇒'
}, {
  mode: 'text',
  match: ['<=', '≤='],
  format: '⇐'
}];

const autoformatLegal = [{
  mode: 'text',
  match: ['(tm)', '(TM)'],
  format: '™'
}, {
  mode: 'text',
  match: ['(r)', '(R)'],
  format: '®'
}, {
  mode: 'text',
  match: ['(c)', '(C)'],
  format: '©'
}];
const autoformatLegalHtml = [{
  mode: 'text',
  match: '&trade;',
  format: '™'
}, {
  mode: 'text',
  match: '&reg;',
  format: '®'
}, {
  mode: 'text',
  match: '&copy;',
  format: '©'
}, {
  mode: 'text',
  match: '&sect;',
  format: '§'
}];

const autoformatPunctuation = [{
  mode: 'text',
  match: '--',
  format: '\u2014'
}, {
  mode: 'text',
  match: '...',
  format: '…'
}, {
  mode: 'text',
  match: '>>',
  format: '»'
}, {
  mode: 'text',
  match: '<<',
  format: '«'
}];

const autoformatSmartQuotes = [{
  mode: 'text',
  match: '"',
  format: ['“', '”']
}, {
  mode: 'text',
  match: "'",
  format: ['‘', '’']
}];

const autoformatComparison = [{
  mode: 'text',
  match: '!>',
  format: '≯'
}, {
  mode: 'text',
  match: '!<',
  format: '≮'
}, {
  mode: 'text',
  match: '>=',
  format: '≥'
}, {
  mode: 'text',
  match: '<=',
  format: '≤'
}, {
  mode: 'text',
  match: '!>=',
  format: '≱'
}, {
  mode: 'text',
  match: '!<=',
  format: '≰'
}];

const autoformatEquality = [{
  mode: 'text',
  match: '!=',
  format: '≠'
}, {
  mode: 'text',
  match: '==',
  format: '≡'
}, {
  mode: 'text',
  match: ['!==', '≠='],
  format: '≢'
}, {
  mode: 'text',
  match: '~=',
  format: '≈'
}, {
  mode: 'text',
  match: '!~=',
  format: '≉'
}];

const autoformatFraction = [{
  mode: 'text',
  match: '1/2',
  format: '½'
}, {
  mode: 'text',
  match: '1/3',
  format: '⅓'
}, {
  mode: 'text',
  match: '1/4',
  format: '¼'
}, {
  mode: 'text',
  match: '1/5',
  format: '⅕'
}, {
  mode: 'text',
  match: '1/6',
  format: '⅙'
}, {
  mode: 'text',
  match: '1/7',
  format: '⅐'
}, {
  mode: 'text',
  match: '1/8',
  format: '⅛'
}, {
  mode: 'text',
  match: '1/9',
  format: '⅑'
}, {
  mode: 'text',
  match: '1/10',
  format: '⅒'
}, {
  mode: 'text',
  match: '2/3',
  format: '⅔'
}, {
  mode: 'text',
  match: '2/5',
  format: '⅖'
}, {
  mode: 'text',
  match: '3/4',
  format: '¾'
}, {
  mode: 'text',
  match: '3/5',
  format: '⅗'
}, {
  mode: 'text',
  match: '3/8',
  format: '⅜'
}, {
  mode: 'text',
  match: '4/5',
  format: '⅘'
}, {
  mode: 'text',
  match: '5/6',
  format: '⅚'
}, {
  mode: 'text',
  match: '5/8',
  format: '⅝'
}, {
  mode: 'text',
  match: '7/8',
  format: '⅞'
}];

const autoformatDivision = [{
  mode: 'text',
  match: '//',
  format: '÷'
}];
const autoformatOperation = [{
  mode: 'text',
  match: '+-',
  format: '±'
}, {
  mode: 'text',
  match: '%%',
  format: '‰'
}, {
  mode: 'text',
  match: ['%%%', '‰%'],
  format: '‱'
}, ...autoformatDivision];

const autoformatSubscriptNumbers = [{
  mode: 'text',
  match: '~0',
  format: '₀'
}, {
  mode: 'text',
  match: '~1',
  format: '₁'
}, {
  mode: 'text',
  match: '~2',
  format: '₂'
}, {
  mode: 'text',
  match: '~3',
  format: '₃'
}, {
  mode: 'text',
  match: '~4',
  format: '₄'
}, {
  mode: 'text',
  match: '~5',
  format: '₅'
}, {
  mode: 'text',
  match: '~6',
  format: '₆'
}, {
  mode: 'text',
  match: '~7',
  format: '₇'
}, {
  mode: 'text',
  match: '~8',
  format: '₈'
}, {
  mode: 'text',
  match: '~9',
  format: '₉'
}];
const autoformatSubscriptSymbols = [{
  mode: 'text',
  match: '~+',
  format: '₊'
}, {
  mode: 'text',
  match: '~-',
  format: '₋'
}];

const autoformatSuperscriptNumbers = [{
  mode: 'text',
  match: '^0',
  format: '⁰'
}, {
  mode: 'text',
  match: '^1',
  format: '¹'
}, {
  mode: 'text',
  match: '^2',
  format: '²'
}, {
  mode: 'text',
  match: '^3',
  format: '³'
}, {
  mode: 'text',
  match: '^4',
  format: '⁴'
}, {
  mode: 'text',
  match: '^5',
  format: '⁵'
}, {
  mode: 'text',
  match: '^6',
  format: '⁶'
}, {
  mode: 'text',
  match: '^7',
  format: '⁷'
}, {
  mode: 'text',
  match: '^8',
  format: '⁸'
}, {
  mode: 'text',
  match: '^9',
  format: '⁹'
}];
const autoformatSuperscriptSymbols = [{
  mode: 'text',
  match: '^o',
  format: '°'
}, {
  mode: 'text',
  match: '^+',
  format: '⁺'
}, {
  mode: 'text',
  match: '^-',
  format: '⁻'
}];

const autoformatMath = [...autoformatComparison, ...autoformatEquality, ...autoformatOperation, ...autoformatFraction, ...autoformatSuperscriptSymbols, ...autoformatSubscriptSymbols, ...autoformatSuperscriptNumbers, ...autoformatSubscriptNumbers];

exports.autoformatArrow = autoformatArrow;
exports.autoformatBlock = autoformatBlock;
exports.autoformatComparison = autoformatComparison;
exports.autoformatDivision = autoformatDivision;
exports.autoformatEquality = autoformatEquality;
exports.autoformatFraction = autoformatFraction;
exports.autoformatLegal = autoformatLegal;
exports.autoformatLegalHtml = autoformatLegalHtml;
exports.autoformatMark = autoformatMark;
exports.autoformatMath = autoformatMath;
exports.autoformatOperation = autoformatOperation;
exports.autoformatPunctuation = autoformatPunctuation;
exports.autoformatSmartQuotes = autoformatSmartQuotes;
exports.autoformatSubscriptNumbers = autoformatSubscriptNumbers;
exports.autoformatSubscriptSymbols = autoformatSubscriptSymbols;
exports.autoformatSuperscriptNumbers = autoformatSuperscriptNumbers;
exports.autoformatSuperscriptSymbols = autoformatSuperscriptSymbols;
exports.autoformatText = autoformatText;
exports.createAutoformatPlugin = createAutoformatPlugin;
exports.getMatchPoints = getMatchPoints;
exports.getMatchRange = getMatchRange;
exports.isPreviousCharacterEmpty = isPreviousCharacterEmpty;
exports.withAutoformat = withAutoformat;
//# sourceMappingURL=index.js.map
