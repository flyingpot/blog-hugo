'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');
var slate = require('slate');

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var lib = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Constants.
 */

var IS_MAC = typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

var MODIFIERS = {
  alt: 'altKey',
  control: 'ctrlKey',
  meta: 'metaKey',
  shift: 'shiftKey'
};

var ALIASES = {
  add: '+',
  break: 'pause',
  cmd: 'meta',
  command: 'meta',
  ctl: 'control',
  ctrl: 'control',
  del: 'delete',
  down: 'arrowdown',
  esc: 'escape',
  ins: 'insert',
  left: 'arrowleft',
  mod: IS_MAC ? 'meta' : 'control',
  opt: 'alt',
  option: 'alt',
  return: 'enter',
  right: 'arrowright',
  space: ' ',
  spacebar: ' ',
  up: 'arrowup',
  win: 'meta',
  windows: 'meta'
};

var CODES = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  control: 17,
  alt: 18,
  pause: 19,
  capslock: 20,
  escape: 27,
  ' ': 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  arrowleft: 37,
  arrowup: 38,
  arrowright: 39,
  arrowdown: 40,
  insert: 45,
  delete: 46,
  meta: 91,
  numlock: 144,
  scrolllock: 145,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  '\'': 222
};

for (var f = 1; f < 20; f++) {
  CODES['f' + f] = 111 + f;
}

/**
 * Is hotkey?
 */

function isHotkey(hotkey, options, event) {
  if (options && !('byKey' in options)) {
    event = options;
    options = null;
  }

  if (!Array.isArray(hotkey)) {
    hotkey = [hotkey];
  }

  var array = hotkey.map(function (string) {
    return parseHotkey(string, options);
  });
  var check = function check(e) {
    return array.some(function (object) {
      return compareHotkey(object, e);
    });
  };
  var ret = event == null ? check : check(event);
  return ret;
}

function isCodeHotkey(hotkey, event) {
  return isHotkey(hotkey, event);
}

function isKeyHotkey(hotkey, event) {
  return isHotkey(hotkey, { byKey: true }, event);
}

/**
 * Parse.
 */

function parseHotkey(hotkey, options) {
  var byKey = options && options.byKey;
  var ret = {};

  // Special case to handle the `+` key since we use it as a separator.
  hotkey = hotkey.replace('++', '+add');
  var values = hotkey.split('+');
  var length = values.length;

  // Ensure that all the modifiers are set to false unless the hotkey has them.

  for (var k in MODIFIERS) {
    ret[MODIFIERS[k]] = false;
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var value = _step.value;

      var optional = value.endsWith('?') && value.length > 1;

      if (optional) {
        value = value.slice(0, -1);
      }

      var name = toKeyName(value);
      var modifier = MODIFIERS[name];

      if (length === 1 || !modifier) {
        if (byKey) {
          ret.key = name;
        } else {
          ret.which = toKeyCode(value);
        }
      }

      if (modifier) {
        ret[modifier] = optional ? null : true;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return ret;
}

/**
 * Compare.
 */

function compareHotkey(object, event) {
  for (var key in object) {
    var expected = object[key];
    var actual = void 0;

    if (expected == null) {
      continue;
    }

    if (key === 'key' && event.key != null) {
      actual = event.key.toLowerCase();
    } else if (key === 'which') {
      actual = expected === 91 && event.which === 93 ? 91 : event.which;
    } else {
      actual = event[key];
    }

    if (actual == null && expected === false) {
      continue;
    }

    if (actual !== expected) {
      return false;
    }
  }

  return true;
}

/**
 * Utils.
 */

function toKeyCode(name) {
  name = toKeyName(name);
  var code = CODES[name] || name.toUpperCase().charCodeAt(0);
  return code;
}

function toKeyName(name) {
  name = name.toLowerCase();
  name = ALIASES[name] || name;
  return name;
}

/**
 * Export.
 */

exports.default = isHotkey;
exports.isHotkey = isHotkey;
exports.isCodeHotkey = isCodeHotkey;
exports.isKeyHotkey = isKeyHotkey;
exports.parseHotkey = parseHotkey;
exports.compareHotkey = compareHotkey;
exports.toKeyCode = toKeyCode;
exports.toKeyName = toKeyName;
});

var isHotkey = unwrapExports(lib);
lib.isHotkey;
lib.isCodeHotkey;
lib.isKeyHotkey;
lib.parseHotkey;
lib.compareHotkey;
lib.toKeyCode;
lib.toKeyName;

/**
 * Check if the selection is at the edge of its parent block.
 * If it is and if the selection is expanded, delete its content.
 */
const exitBreakAtEdges = (editor, {
  start,
  end
}) => {
  let queryEdge = false;
  let isEdge = false;
  let isStart = false;

  if (start || end) {
    queryEdge = true;

    if (start && plateCommon.isSelectionAtBlockStart(editor)) {
      isEdge = true;
      isStart = true;
    }

    if (end && plateCommon.isSelectionAtBlockEnd(editor)) {
      isEdge = true;
    }

    if (isEdge && plateCommon.isExpanded(editor.selection)) {
      editor.deleteFragment();
    }
  }

  return {
    queryEdge,
    isEdge,
    isStart
  };
};
const getExitBreakOnKeyDown = ({
  rules = [{
    hotkey: 'mod+enter'
  }, {
    hotkey: 'mod+shift+enter',
    before: true
  }]
} = {}) => editor => event => {
  const entry = plateCommon.getBlockAbove(editor);
  if (!entry) return;
  rules.forEach(({
    hotkey,
    query = {},
    level = 0,
    before,
    defaultType = plateCore.getPlatePluginType(editor, plateCommon.ELEMENT_DEFAULT)
  }) => {
    if (isHotkey(hotkey, event) && plateCommon.queryNode(entry, query)) {
      if (!editor.selection) return;
      const {
        queryEdge,
        isEdge,
        isStart
      } = exitBreakAtEdges(editor, query);
      if (isStart) before = true;
      if (queryEdge && !isEdge) return;
      event.preventDefault();
      const selectionPath = slate.Editor.path(editor, editor.selection);
      let insertPath;

      if (before) {
        insertPath = selectionPath.slice(0, level + 1);
      } else {
        insertPath = slate.Path.next(selectionPath.slice(0, level + 1));
      }

      plateCommon.insertNodes(editor, {
        type: defaultType,
        children: [{
          text: ''
        }]
      }, {
        at: insertPath,
        select: !isStart
      });
    }
  });
};

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
const createExitBreakPlugin = (options = {}) => ({
  onKeyDown: getExitBreakOnKeyDown(options)
});

const getSingleLineKeyDown = () => () => event => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};

const withSingleLine = () => editor => {
  const {
    normalizeNode
  } = editor;

  editor.insertBreak = () => null;

  editor.normalizeNode = entry => {
    if (editor.children.length > 1) {
      slate.Transforms.removeNodes(editor, {
        at: [],
        mode: 'highest',
        match: (node, path) => path[0] > 0
      });
    }

    normalizeNode(entry);
  };

  return editor;
};

/**
 * Forces editor to only have one line.
 */

const createSingleLinePlugin = () => ({
  onKeyDown: getSingleLineKeyDown(),
  withOverrides: withSingleLine()
});

const getSoftBreakOnKeyDown = ({
  rules = [{
    hotkey: 'shift+enter'
  }]
} = {}) => editor => event => {
  const entry = plateCommon.getBlockAbove(editor);
  if (!entry) return;
  rules.forEach(({
    hotkey,
    query
  }) => {
    if (isHotkey(hotkey, event) && plateCommon.queryNode(entry, query)) {
      event.preventDefault();
      editor.insertText('\n');
    }
  });
};

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
const createSoftBreakPlugin = (options = {}) => ({
  onKeyDown: getSoftBreakOnKeyDown(options)
});

exports.createExitBreakPlugin = createExitBreakPlugin;
exports.createSingleLinePlugin = createSingleLinePlugin;
exports.createSoftBreakPlugin = createSoftBreakPlugin;
exports.exitBreakAtEdges = exitBreakAtEdges;
exports.getExitBreakOnKeyDown = getExitBreakOnKeyDown;
exports.getSingleLineKeyDown = getSingleLineKeyDown;
exports.getSoftBreakOnKeyDown = getSoftBreakOnKeyDown;
exports.withSingleLine = withSingleLine;
//# sourceMappingURL=index.js.map
