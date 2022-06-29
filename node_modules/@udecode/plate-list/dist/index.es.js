import { getPlatePluginOptions, getPlatePluginType, getPlatePluginTypes, mapPlatePluginKeysToOptions, isElement, getRenderElement, getSlateClass } from '@udecode/plate-core';
import { getElementDeserializer, findNode, getParent, getAbove, isCollapsed, getNode, match, isRangeAcrossBlocks, someNode, wrapNodes, findDescendant, getLastChildPath, moveChildren, setNodes, ELEMENT_DEFAULT, unwrapNodes, isLastChild, insertNodes, getNodes, isBlockTextEmptyAfterSelection, isFirstChild, isExpanded, getPreviousPath, deleteFragment, isSelectionAtBlockStart, isSelectionAtBlockEnd, getBlockAbove, getText, getChildren, isBlockAboveEmpty, insertEmptyElement, getNodeDeserializer, getToggleElementOnKeyDown } from '@udecode/plate-common';
import { Path, Range, Editor, Transforms, Node } from 'slate';
import { getResetNodeOnKeyDown, SIMULATE_BACKSPACE } from '@udecode/plate-reset-node';

const ELEMENT_UL = 'ul';
const ELEMENT_OL = 'ol';
const ELEMENT_LI = 'li';
const ELEMENT_LIC = 'lic';
const KEYS_LIST = [ELEMENT_UL, ELEMENT_OL, ELEMENT_LI, ELEMENT_LIC];

const getListDeserialize = () => editor => {
  const li = getPlatePluginOptions(editor, ELEMENT_LI);
  const lic = getPlatePluginOptions(editor, ELEMENT_LIC);
  const ul = getPlatePluginOptions(editor, ELEMENT_UL);
  const ol = getPlatePluginOptions(editor, ELEMENT_OL);
  return {
    element: [...getElementDeserializer({
      type: ul.type,
      rules: [{
        nodeNames: 'UL'
      }],
      ...ul.deserialize
    }), ...getElementDeserializer({
      type: ol.type,
      rules: [{
        nodeNames: 'OL'
      }],
      ...ol.deserialize
    }), ...getElementDeserializer({
      type: li.type,
      rules: [{
        nodeNames: 'LI'
      }],
      ...li.deserialize
    }), ...getElementDeserializer({
      type: lic.type,
      rules: [{
        nodeNames: 'LIC'
      }],
      ...lic.deserialize
    })],
    preInsert: () => {
      const liEntry = findNode(editor, {
        match: {
          type: li.type
        }
      });

      if (liEntry) {
        return true;
      }
    }
  };
};

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
 * Is the list nested, i.e. its parent is a list item.
 */

const isListNested = (editor, listPath) => {
  var _getParent;

  const listParentNode = (_getParent = getParent(editor, listPath)) === null || _getParent === void 0 ? void 0 : _getParent[0];
  return (listParentNode === null || listParentNode === void 0 ? void 0 : listParentNode.type) === getPlatePluginType(editor, ELEMENT_LI);
};

const getListTypes = editor => {
  return [getPlatePluginType(editor, ELEMENT_OL), getPlatePluginType(editor, ELEMENT_UL)];
};

/**
 * Find the highest end list that can be deleted.
 * Its path should be different to diffListPath.
 * If the highest end list 2+ items, return liPath.
 * Get the parent list until:
 * - the list has less than 2 items.
 * - its path is not equals to diffListPath.
 */

const getHighestEmptyList = (editor, {
  diffListPath,
  liPath
}) => {
  const list = getAbove(editor, {
    at: liPath,
    match: {
      type: getListTypes(editor)
    }
  });
  if (!list) return;
  const [listNode, listPath] = list;

  if (!diffListPath || !Path.equals(listPath, diffListPath)) {
    if (listNode.children.length < 2) {
      const liParent = getAbove(editor, {
        at: listPath,
        match: {
          type: getPlatePluginType(editor, ELEMENT_LI)
        }
      });

      if (liParent) {
        return getHighestEmptyList(editor, {
          liPath: liParent[1],
          diffListPath
        }) || listPath;
      }
    }

    return liPath;
  }
};

/**
 * Returns the nearest li and ul / ol wrapping node entries for a given path (default = selection)
 */

const getListItemEntry = (editor, {
  at = editor.selection
} = {}) => {
  const liType = getPlatePluginType(editor, ELEMENT_LI);

  let _at;

  if (Range.isRange(at) && !isCollapsed(at)) {
    _at = at.focus.path;
  } else if (Range.isRange(at)) {
    _at = at.anchor.path;
  } else {
    _at = at;
  }

  if (_at) {
    const node = getNode(editor, _at);

    if (node) {
      const listItem = getAbove(editor, {
        at: _at,
        match: {
          type: liType
        }
      });

      if (listItem) {
        const list = getParent(editor, listItem[1]);
        return {
          list,
          listItem
        };
      }
    }
  }
};

/**
 * Searches upward for the root list element
 */

const getListRoot = (editor, at = editor.selection) => {
  if (!at) return;
  const parentList = getAbove(editor, {
    at,
    match: {
      type: [getPlatePluginType(editor, ELEMENT_UL), getPlatePluginType(editor, ELEMENT_OL)]
    }
  });

  if (parentList) {
    var _getListRoot;

    const [, parentListPath] = parentList;
    return (_getListRoot = getListRoot(editor, parentListPath)) !== null && _getListRoot !== void 0 ? _getListRoot : parentList;
  }
};

/**
 * Is there a list child in the node.
 */

const hasListChild = (editor, node) => node.children.some(n => match(n, {
  type: getListTypes(editor)
}));

/**
 * Is selection across blocks with list items
 */

const isAcrossListItems = editor => {
  const {
    selection
  } = editor;

  if (!selection || isCollapsed(selection)) {
    return false;
  }

  const isAcrossBlocks = isRangeAcrossBlocks(editor);
  if (!isAcrossBlocks) return false;
  return someNode(editor, {
    match: {
      type: getPlatePluginType(editor, ELEMENT_LI)
    }
  });
};

const moveListItemDown = (editor, {
  list,
  listItem
}) => {
  const [listNode] = list;
  const [, listItemPath] = listItem;
  let previousListItemPath;

  try {
    previousListItemPath = Path.previous(listItemPath);
  } catch (e) {
    return;
  } // Previous sibling is the new parent


  const previousSiblingItem = Editor.node(editor, previousListItemPath);

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;
    const sublist = previousNode.children.find(n => match(n, {
      type: getListTypes(editor)
    }));
    const newPath = previousPath.concat(sublist ? [1, sublist.children.length] : [1]);
    Editor.withoutNormalizing(editor, () => {
      if (!sublist) {
        // Create new sublist
        wrapNodes(editor, {
          type: listNode.type,
          children: []
        }, {
          at: listItemPath
        });
      } // Move the current item to the sublist


      Transforms.moveNodes(editor, {
        at: listItemPath,
        to: newPath
      });
    });
  }
};

/**
 * Move the list items of the sublist of `fromListItem` to `toList` (if `fromListItem` is defined).
 * Move the list items of `fromList` to `toList` (if `fromList` is defined).
 */
const moveListItemsToList = (editor, {
  fromList,
  fromListItem,
  fromStartIndex,
  to: _to,
  toList,
  toListIndex = null,
  deleteFromList = true
}) => {
  let fromListPath;
  let moved;
  Editor.withoutNormalizing(editor, () => {
    if (fromListItem) {
      const fromListItemSublist = findDescendant(editor, {
        at: fromListItem[1],
        match: {
          type: getListTypes(editor)
        }
      });
      if (!fromListItemSublist) return 0;
      fromListPath = fromListItemSublist === null || fromListItemSublist === void 0 ? void 0 : fromListItemSublist[1];
    } else if (fromList) {
      // eslint-disable-next-line prefer-destructuring
      fromListPath = fromList[1];
    } else {
      return;
    }

    let to = null;
    if (_to) to = _to;

    if (toList) {
      if (toListIndex !== null) to = toList[1].concat([toListIndex]);else {
        const lastChildPath = getLastChildPath(toList);
        to = Path.next(lastChildPath);
      }
    }

    if (!to) return;
    moved = moveChildren(editor, {
      at: fromListPath,
      to,
      fromStartIndex
    }); // Remove the empty list

    if (deleteFromList) {
      Transforms.delete(editor, {
        at: fromListPath
      });
    }
  });
  return moved;
};

const unwrapList = (editor, {
  at
} = {}) => {
  Editor.withoutNormalizing(editor, () => {
    do {
      setNodes(editor, {
        type: getPlatePluginType(editor, ELEMENT_DEFAULT)
      });
      unwrapNodes(editor, {
        at,
        match: {
          type: getPlatePluginType(editor, ELEMENT_LI)
        },
        split: true
      });
      unwrapNodes(editor, {
        at,
        match: {
          type: [getPlatePluginType(editor, ELEMENT_UL), getPlatePluginType(editor, ELEMENT_OL)]
        },
        split: true
      });
    } while (getAbove(editor, {
      match: {
        type: getListTypes(editor),
        at
      }
    }));
  });
};

/**
 * Move a list item up.
 */
const moveListItemUp = (editor, {
  list,
  listItem
}) => {
  const move = () => {
    const [listNode, listPath] = list;
    const [liNode, liPath] = listItem;
    const liParent = getAbove(editor, {
      at: listPath,
      match: {
        type: getPlatePluginType(editor, ELEMENT_LI)
      }
    });

    if (!liParent) {
      let toListPath;

      try {
        toListPath = Path.next(listPath);
      } catch (err) {
        return;
      }

      const condA = hasListChild(editor, liNode);
      const condB = !isLastChild(list, liPath);

      if (condA || condB) {
        // Insert a new list next to `list`
        insertNodes(editor, {
          type: listNode.type,
          children: []
        }, {
          at: toListPath
        });
      }

      if (condA) {
        const toListNode = getNode(editor, toListPath);
        if (!toListNode) return; // Move li sub-lis to the new list

        moveListItemsToList(editor, {
          fromListItem: listItem,
          toList: [toListNode, toListPath]
        });
      } // If there is siblings li, move them to the new list


      if (condB) {
        const toListNode = getNode(editor, toListPath);
        if (!toListNode) return; // Move next lis to the new list

        moveListItemsToList(editor, {
          fromList: list,
          fromStartIndex: liPath[liPath.length - 1] + 1,
          toList: [toListNode, toListPath],
          deleteFromList: false
        });
      } // Finally, unwrap the list


      unwrapList(editor, {
        at: liPath.concat(0)
      });
      return true;
    }

    const [, liParentPath] = liParent;
    const toListPath = liPath.concat([1]); // If li has next siblings, we need to move them.

    if (!isLastChild(list, liPath)) {
      // If li has no sublist, insert one.
      if (!hasListChild(editor, liNode)) {
        insertNodes(editor, {
          type: listNode.type,
          children: []
        }, {
          at: toListPath
        });
      }

      const toListNode = getNode(editor, toListPath);
      if (!toListNode) return; // Move next siblings to li sublist.

      moveListItemsToList(editor, {
        fromListItem: liParent,
        toList: [toListNode, toListPath],
        fromStartIndex: liPath[liPath.length - 1] + 1,
        deleteFromList: false
      });
    }

    const movedUpLiPath = Path.next(liParentPath); // Move li one level up: next to the li parent.

    Transforms.moveNodes(editor, {
      at: liPath,
      to: movedUpLiPath
    });
    return true;
  };

  let moved = false;
  Editor.withoutNormalizing(editor, () => {
    moved = move();
  });
  return moved;
};

const moveListItems = (editor, {
  increase = true,
  at = (() => {
    var _editor$selection;

    return (_editor$selection = editor.selection) !== null && _editor$selection !== void 0 ? _editor$selection : undefined;
  })()
} = {}) => {
  // Get the selected lic
  const [...lics] = getNodes(editor, {
    at,
    match: {
      type: getPlatePluginType(editor, ELEMENT_LIC)
    }
  });
  if (!lics.length) return;
  const highestLicPaths = [];
  const highestLicPathRefs = []; // Filter out the nested lic, we just need to move the highest ones

  lics.forEach(lic => {
    const licPath = lic[1];
    const liPath = Path.parent(licPath);
    const isAncestor = highestLicPaths.some(path => {
      const highestLiPath = Path.parent(path);
      return Path.isAncestor(highestLiPath, liPath);
    });

    if (!isAncestor) {
      highestLicPaths.push(licPath);
      highestLicPathRefs.push(Editor.pathRef(editor, licPath));
    }
  });
  const licPathRefsToMove = increase ? highestLicPathRefs : highestLicPathRefs.reverse();
  Editor.withoutNormalizing(editor, () => {
    licPathRefsToMove.forEach(licPathRef => {
      const licPath = licPathRef.unref();
      if (!licPath) return;
      const listItem = getParent(editor, licPath);
      if (!listItem) return;
      const listEntry = getParent(editor, listItem[1]);

      if (increase) {
        moveListItemDown(editor, {
          list: listEntry,
          listItem: listItem
        });
      } else if (listEntry && isListNested(editor, listEntry[1])) {
        moveListItemUp(editor, {
          list: listEntry,
          listItem: listItem
        });
      }
    });
  });
};

const indentListItems = editor => {
  moveListItems(editor, {
    increase: true
  });
};

/**
 * Insert list item if selection in li>p.
 * TODO: test
 */

const insertListItem = editor => {
  const liType = getPlatePluginType(editor, ELEMENT_LI);
  const licType = getPlatePluginType(editor, ELEMENT_LIC);

  if (!editor.selection) {
    return false;
  }

  const licEntry = getAbove(editor, {
    match: {
      type: licType
    }
  });
  if (!licEntry) return false;
  const [, paragraphPath] = licEntry;
  const listItemEntry = getParent(editor, paragraphPath);
  if (!listItemEntry) return false;
  const [listItemNode, listItemPath] = listItemEntry;
  if (listItemNode.type !== liType) return false;
  let success = false;
  Editor.withoutNormalizing(editor, () => {
    if (!Range.isCollapsed(editor.selection)) {
      Transforms.delete(editor);
    }

    const isStart = Editor.isStart(editor, editor.selection.focus, paragraphPath);
    const isEnd = isBlockTextEmptyAfterSelection(editor);
    const nextParagraphPath = Path.next(paragraphPath);
    const nextListItemPath = Path.next(listItemPath);
    /**
     * If start, insert a list item before
     */

    if (isStart) {
      insertNodes(editor, {
        type: liType,
        children: [{
          type: licType,
          children: [{
            text: ''
          }]
        }]
      }, {
        at: listItemPath
      });
      success = true;
      return;
    }
    /**
     * If not end, split nodes, wrap a list item on the new paragraph and move it to the next list item
     */


    if (!isEnd) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor);
        wrapNodes(editor, {
          type: liType,
          children: []
        }, {
          at: nextParagraphPath
        });
        Transforms.moveNodes(editor, {
          at: nextParagraphPath,
          to: nextListItemPath
        });
        Transforms.select(editor, nextListItemPath);
        Transforms.collapse(editor, {
          edge: 'start'
        });
      });
    } else {
      /**
       * If end, insert a list item after and select it
       */
      const marks = Editor.marks(editor) || {};
      insertNodes(editor, {
        type: liType,
        children: [{
          type: licType,
          children: [{
            text: '',
            ...marks
          }]
        }]
      }, {
        at: nextListItemPath
      });
      Transforms.select(editor, nextListItemPath);
    }
    /**
     * If there is a list in the list item, move it to the next list item
     */


    if (listItemNode.children.length > 1) {
      Transforms.moveNodes(editor, {
        at: nextParagraphPath,
        to: nextListItemPath.concat(1)
      });
    }

    success = true;
  });
  return success;
};

/**
 * Move fromListItem sublist list items to the end of `toListItem` sublist.
 * If there is no `toListItem` sublist, insert one.
 */
const moveListItemSublistItemsToListItemSublist = (editor, {
  fromListItem,
  toListItem,
  start
}) => {
  const [, fromListItemPath] = fromListItem;
  const [, toListItemPath] = toListItem;
  let moved = 0;
  Editor.withoutNormalizing(editor, () => {
    const fromListItemSublist = findDescendant(editor, {
      at: fromListItemPath,
      match: {
        type: getListTypes(editor)
      }
    });
    if (!fromListItemSublist) return 0;
    const [, fromListItemSublistPath] = fromListItemSublist;
    const toListItemSublist = findDescendant(editor, {
      at: toListItemPath,
      match: {
        type: getListTypes(editor)
      }
    });
    let to;

    if (!toListItemSublist) {
      const fromList = getParent(editor, fromListItemPath);
      if (!fromList) return 0;
      const [fromListNode] = fromList;
      const fromListType = fromListNode.type;
      const toListItemSublistPath = toListItemPath.concat([1]);
      insertNodes(editor, {
        type: fromListType,
        children: []
      }, {
        at: toListItemSublistPath
      });
      to = toListItemSublistPath.concat([0]);
    } else if (start) {
      const [, toListItemSublistPath] = toListItemSublist;
      to = toListItemSublistPath.concat([0]);
    } else {
      to = Path.next(getLastChildPath(toListItemSublist));
    }

    moved = moveChildren(editor, {
      at: fromListItemSublistPath,
      to
    }); // Remove the empty list

    Transforms.delete(editor, {
      at: fromListItemSublistPath
    });
  });
  return moved;
};

const moveListSiblingsAfterCursor = (editor, {
  at,
  to
}) => {
  const offset = at[at.length - 1];
  at = Path.parent(at);
  const listNode = Node.get(editor, at);
  const listEntry = [listNode, at];

  if (!match(listNode, {
    type: getListTypes(editor)
  }) || Path.isParent(at, to) // avoid moving nodes within its own list
  ) {
      return 0;
    }

  return moveChildren(editor, {
    at: listEntry,
    to,
    fromStartIndex: offset + 1
  });
};

/**
 * If list is not nested and if li is not the first child, move li up.
 */

const removeFirstListItem = (editor, {
  list,
  listItem
}) => {
  const [, listPath] = list;
  const [, listItemPath] = listItem;

  if (!isListNested(editor, listPath) && !isFirstChild(listItemPath)) {
    moveListItemUp(editor, {
      list,
      listItem
    });
    return true;
  }

  return false;
};

/**
 * Remove list item and move its sublist to list if any.
 */
const removeListItem = (editor, {
  list,
  listItem,
  reverse = true
}) => {
  const [liNode, liPath] = listItem; // Stop if the list item has no sublist

  if (isExpanded(editor.selection) || !hasListChild(editor, liNode)) {
    return false;
  }

  const previousLiPath = getPreviousPath(liPath);
  let success = false;
  Editor.withoutNormalizing(editor, () => {
    /**
     * If there is a previous li, we need to move sub-lis to the previous li.
     * As we need to delete first, we will:
     * 1. insert a temporary li: tempLi
     * 2. move sub-lis to tempLi
     * 3. delete
     * 4. move sub-lis from tempLi to the previous li.
     * 5. remove tempLi
     */
    if (previousLiPath) {
      const previousLi = Editor.node(editor, previousLiPath); // 1

      let tempLiPath = Path.next(liPath);
      insertNodes(editor, {
        type: getPlatePluginType(editor, ELEMENT_LI),
        children: [{
          type: getPlatePluginType(editor, ELEMENT_LIC),
          children: [{
            text: ''
          }]
        }]
      }, {
        at: tempLiPath
      });
      const tempLi = Editor.node(editor, tempLiPath);
      const tempLiPathRef = Editor.pathRef(editor, tempLi[1]); // 2

      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem: listItem,
        toListItem: tempLi
      }); // 3

      deleteFragment(editor, {
        reverse
      });
      tempLiPath = tempLiPathRef.unref(); // 4

      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem: [tempLi[0], tempLiPath],
        toListItem: previousLi
      }); // 5

      Transforms.removeNodes(editor, {
        at: tempLiPath
      });
      success = true;
      return;
    } // If it's the first li, move the sublist to the parent list


    moveListItemsToList(editor, {
      fromListItem: listItem,
      toList: list,
      toListIndex: 1
    });
  });
  return success;
};

const toggleList = (editor, {
  type
}) => Editor.withoutNormalizing(editor, () => {
  if (!editor.selection) {
    return;
  }

  if (isCollapsed(editor.selection) || !isRangeAcrossBlocks(editor)) {
    // selection is collapsed
    const res = getListItemEntry(editor);

    if (res) {
      const {
        list
      } = res;

      if (list[0].type !== type) {
        setNodes(editor, {
          type
        }, {
          at: editor.selection,
          match: n => getListTypes(editor).includes(n.type),
          mode: 'lowest'
        });
      } else {
        unwrapList(editor);
      }
    } else {
      const list = {
        type,
        children: []
      };
      wrapNodes(editor, list);
      const nodes = [...getNodes(editor, {
        match: {
          type: getPlatePluginType(editor, ELEMENT_DEFAULT)
        }
      })];
      setNodes(editor, {
        type: getPlatePluginType(editor, ELEMENT_LIC)
      });
      const listItem = {
        type: getPlatePluginType(editor, ELEMENT_LI),
        children: []
      };

      for (const [, path] of nodes) {
        wrapNodes(editor, listItem, {
          at: path
        });
      }
    }
  } else {
    // selection is a range
    const [startPoint, endPoint] = Range.edges(editor.selection);
    const commonEntry = Node.common(editor, startPoint.path, endPoint.path);

    if (getListTypes(editor).includes(commonEntry[0].type) || commonEntry[0].type === getPlatePluginType(editor, ELEMENT_LI)) {
      if (commonEntry[0].type !== type) {
        const startList = findNode(editor, {
          at: Range.start(editor.selection),
          match: {
            type: getListTypes(editor)
          },
          mode: 'lowest'
        });
        const endList = findNode(editor, {
          at: Range.end(editor.selection),
          match: {
            type: getListTypes(editor)
          },
          mode: 'lowest'
        });
        const rangeLength = Math.min(startList[1].length, endList[1].length);
        setNodes(editor, {
          type
        }, {
          at: editor.selection,
          match: (n, path) => getListTypes(editor).includes(n.type) && path.length >= rangeLength,
          mode: 'all'
        });
      } else {
        unwrapList(editor);
      }
    } else {
      const rootPathLength = commonEntry[1].length;
      const nodes = Array.from(getNodes(editor, {
        mode: 'all'
      })).filter(([, path]) => path.length === rootPathLength + 1).reverse();
      nodes.forEach(n => {
        if (getListTypes(editor).includes(n[0].type)) {
          setNodes(editor, {
            type
          }, {
            at: n[1]
          });
        } else {
          setNodes(editor, {
            type: getPlatePluginType(editor, ELEMENT_LIC)
          }, {
            at: n[1]
          });
          const listItem = {
            type: getPlatePluginType(editor, ELEMENT_LI),
            children: []
          };
          wrapNodes(editor, listItem, {
            at: n[1]
          });
          const list = {
            type,
            children: []
          };
          wrapNodes(editor, list, {
            at: n[1]
          });
        }
      });
    }
  }
});

const unindentListItems = (editor, options = {}) => moveListItems(editor, { ...options,
  increase: false
});

const getListOnKeyDown = pluginKeys => editor => e => {
  const listTypes = getPlatePluginTypes([ELEMENT_UL, ELEMENT_OL])(editor);

  if (e.key === 'Tab' && editor.selection) {
    const listSelected = getAbove(editor, {
      at: editor.selection,
      match: {
        type: listTypes
      }
    });

    if (listSelected) {
      e.preventDefault();
      moveListItems(editor, {
        increase: !e.shiftKey
      });
      return;
    }
  }

  const options = pluginKeys ? mapPlatePluginKeysToOptions(editor, pluginKeys) : [];
  options.forEach(({
    type,
    hotkey
  }) => {
    if (!hotkey) return;

    const hotkeys = castArray_1(hotkey);

    for (const key of hotkeys) {
      if (isHotkey(key)(e) && listTypes.includes(type)) {
        toggleList(editor, {
          type
        });
      }
    }
  });
};

const getListDeleteBackward = (editor, unit) => {
  const res = getListItemEntry(editor, {});
  let moved = false;

  if (res) {
    const {
      list,
      listItem
    } = res;

    if (isSelectionAtBlockStart(editor, {
      match: node => node.type === ELEMENT_LI
    })) {
      Editor.withoutNormalizing(editor, () => {
        moved = removeFirstListItem(editor, {
          list,
          listItem
        });
        if (moved) return true;
        moved = removeListItem(editor, {
          list,
          listItem
        });
        if (moved) return true;

        if (isFirstChild(listItem[1]) && !isListNested(editor, list[1])) {
          getResetNodeOnKeyDown({
            rules: [{
              types: [getPlatePluginType(editor, ELEMENT_LI)],
              defaultType: getPlatePluginType(editor, ELEMENT_DEFAULT),
              hotkey: 'backspace',
              predicate: () => isSelectionAtBlockStart(editor),
              onReset: _editor => unwrapList(_editor)
            }]
          })(editor)(SIMULATE_BACKSPACE);
          moved = true;
          return;
        }

        deleteFragment(editor, {
          unit,
          reverse: true
        });
        moved = true;
      });
    }
  }

  return moved;
};

const pathToEntry = (editor, path) => Editor.node(editor, path);

const selectionIsNotInAListHandler = editor => {
  const pointAfterSelection = Editor.after(editor, editor.selection.focus.path);

  if (pointAfterSelection) {
    // there is a block after it
    const nextSiblingListRes = getListItemEntry(editor, {
      at: pointAfterSelection
    });

    if (nextSiblingListRes) {
      // the next block is a list
      const {
        listItem
      } = nextSiblingListRes;
      const parentBlockEntity = getBlockAbove(editor, {
        at: editor.selection.anchor
      });

      if (!getText(editor, parentBlockEntity[1])) {
        // the selected block is empty
        Transforms.removeNodes(editor);
        return true;
      }

      if (hasListChild(editor, listItem[0])) {
        // the next block has children, so we have to move the first item up
        const sublistRes = getListItemEntry(editor, {
          at: [...listItem[1], 1, 0, 0]
        });
        moveListItemUp(editor, sublistRes);
      }
    }
  }

  return false;
};

const selectionIsInAListHandler = (editor, res) => {
  const {
    listItem
  } = res; // if it has no children

  if (!hasListChild(editor, listItem[0])) {
    const liType = getPlatePluginType(editor, ELEMENT_LI);
    const liWithSiblings = Array.from(Editor.nodes(editor, {
      at: listItem[1],
      mode: 'lowest',
      match: (node, path) => {
        var _getNode;

        if (path.length === 0) {
          return false;
        }

        const isNodeLi = node.type === liType;
        const isSiblingOfNodeLi = ((_getNode = getNode(editor, Path.next(path))) === null || _getNode === void 0 ? void 0 : _getNode.type) === liType;
        return isNodeLi && isSiblingOfNodeLi;
      }
    }), entry => entry[1])[0];

    if (!liWithSiblings) {
      // there are no more list item in the list
      const pointAfterListItem = Editor.after(editor, listItem[1]);

      if (pointAfterListItem) {
        // there is a block after it
        const nextSiblingListRes = getListItemEntry(editor, {
          at: pointAfterListItem
        });

        if (nextSiblingListRes) {
          // it is a list so we merge the lists
          const listRoot = getListRoot(editor, listItem[1]);
          moveListItemsToList(editor, {
            fromList: nextSiblingListRes.list,
            toList: listRoot,
            deleteFromList: true
          });
          return true;
        }
      }

      return false;
    }

    const siblingListItem = pathToEntry(editor, Path.next(liWithSiblings));
    const siblingList = Editor.parent(editor, siblingListItem[1]);

    if (removeListItem(editor, {
      list: siblingList,
      listItem: siblingListItem,
      reverse: false
    })) {
      return true;
    } // if (skipDefaultDelete) return skipDefaultDelete;


    return false;
  } // if it has children


  const nestedList = pathToEntry(editor, Path.next([...listItem[1], 0]));
  const nestedListItem = getChildren(nestedList)[0];

  if (removeFirstListItem(editor, {
    list: nestedList,
    listItem: nestedListItem
  })) {
    return true;
  }

  if (removeListItem(editor, {
    list: nestedList,
    listItem: nestedListItem
  })) {
    return true;
  }

  return false;
};

const getListDeleteForward = editor => {
  let skipDefaultDelete = false;

  if (!(editor !== null && editor !== void 0 && editor.selection)) {
    return skipDefaultDelete;
  }

  if (!isSelectionAtBlockEnd(editor)) {
    return skipDefaultDelete;
  }

  Editor.withoutNormalizing(editor, () => {
    const res = getListItemEntry(editor, {});

    if (!res) {
      skipDefaultDelete = selectionIsNotInAListHandler(editor);
      return;
    }

    skipDefaultDelete = selectionIsInAListHandler(editor, res);
  });
  return skipDefaultDelete;
};

const getListDeleteFragment = editor => {
  let deleted = false;
  Editor.withoutNormalizing(editor, () => {
    // Selection should be across list items
    if (!isAcrossListItems(editor)) return;
    /**
     * Check if the end li can be deleted (if it has no sublist).
     * Store the path ref to delete it after deleteFragment.
     */

    const end = Editor.end(editor, editor.selection);
    const liEnd = getAbove(editor, {
      at: end,
      match: {
        type: getPlatePluginType(editor, ELEMENT_LI)
      }
    });
    const liEndCanBeDeleted = liEnd && !hasListChild(editor, liEnd[0]);
    const liEndPathRef = liEndCanBeDeleted ? Editor.pathRef(editor, liEnd[1]) : undefined;
    /**
     * Delete fragment and move end block children to start block
     */

    deleteFragment(editor);
    const start = Editor.start(editor, editor.selection);
    const liStart = getAbove(editor, {
      at: start,
      match: {
        type: getPlatePluginType(editor, ELEMENT_LI)
      }
    });

    if (liEndPathRef) {
      const liEndPath = liEndPathRef.unref();
      const listStart = liStart && getParent(editor, liStart[1]);
      const deletePath = getHighestEmptyList(editor, {
        liPath: liEndPath,
        diffListPath: listStart === null || listStart === void 0 ? void 0 : listStart[1]
      });

      if (deletePath) {
        Transforms.removeNodes(editor, {
          at: deletePath
        });
      }

      deleted = true;
    }
  });
  return deleted;
};

const getListInsertBreak = editor => {
  if (!editor.selection) return;
  const res = getListItemEntry(editor, {});
  let moved; // If selection is in a li

  if (res) {
    const {
      list,
      listItem
    } = res; // If selected li is empty, move it up.

    if (isBlockAboveEmpty(editor)) {
      moved = moveListItemUp(editor, {
        list,
        listItem
      });
      if (moved) return true;
    }
  }

  const didReset = getResetNodeOnKeyDown({
    rules: [{
      types: [getPlatePluginType(editor, ELEMENT_LI)],
      defaultType: getPlatePluginType(editor, ELEMENT_DEFAULT),
      predicate: () => !moved && isBlockAboveEmpty(editor),
      onReset: _editor => unwrapList(_editor)
    }]
  })(editor)(SIMULATE_BACKSPACE);
  if (didReset) return true;
  /**
   * If selection is in li > p, insert li.
   */

  if (!moved) {
    const inserted = insertListItem(editor);
    if (inserted) return true;
  }
};

const getListInsertFragment = editor => {
  const {
    insertFragment
  } = editor;
  const li = getPlatePluginOptions(editor, ELEMENT_LI);
  const ul = getPlatePluginOptions(editor, ELEMENT_UL);
  const ol = getPlatePluginOptions(editor, ELEMENT_OL);

  const isListRoot = node => [ul.type, ol.type].includes(node.type);

  const getFirstAncestorOfType = (root, entry, {
    type
  }) => {
    let ancestor = Path.parent(entry[1]);

    while (Node.get(root, ancestor).type !== type) {
      ancestor = Path.parent(ancestor);
    }

    return [Node.get(root, ancestor), ancestor];
  };
  /**
   * Removes the "empty" leading lis. Empty in this context means lis only with other lis as children.
   *
   * @returns If argument is not a list root, returns it, otherwise returns ul[] or li[].
   */


  const trimList = listRoot => {
    if (!isListRoot(listRoot)) {
      return [listRoot];
    }

    const textEntries = Array.from(Node.texts(listRoot));
    const commonAncestorEntry = textEntries.reduce((commonAncestor, textEntry) => Path.isAncestor(commonAncestor[1], textEntry[1]) ? commonAncestor : Node.common(listRoot, textEntry[1], commonAncestor[1]), // any list item would do, we grab the first one
    getFirstAncestorOfType(listRoot, textEntries[0], li));
    return isListRoot(commonAncestorEntry[0]) ? commonAncestorEntry[0].children : [commonAncestorEntry[0]];
  };

  return fragment => {
    const liEntry = findNode(editor, {
      match: {
        type: li.type
      },
      mode: 'lowest'
    });

    if (liEntry) {
      const [, liPath] = liEntry; // FIXME: fork insertFragment for edge cases

      return Transforms.insertNodes(editor, fragment.flatMap(node => trimList(node)), {
        at: Path.next(liPath),
        select: true
      });
    }

    const filtered = isListRoot(fragment[0]) ? [{
      text: ''
    }, ...fragment] : fragment;
    return insertFragment(filtered);
  };
};

/**
 * Recursively get all the:
 * - block children
 * - inline children except those at excludeDepth
 */
const getDeepInlineChildren = (editor, {
  children
}) => {
  const inlineChildren = [];

  for (const child of children) {
    if (Editor.isBlock(editor, child[0])) {
      inlineChildren.push(...getDeepInlineChildren(editor, {
        children: getChildren(child)
      }));
    } else {
      inlineChildren.push(child);
    }
  }

  return inlineChildren;
};
/**
 * If the list item has no child: insert an empty list item container.
 * Else: move the children that are not valid to the list item container.
 */

const normalizeListItem = (editor, {
  listItem,
  validLiChildrenTypes = []
}) => {
  var _ref;

  let changed = false;
  const allValidLiChildrenTypes = [getPlatePluginType(editor, ELEMENT_UL), getPlatePluginType(editor, ELEMENT_OL), getPlatePluginType(editor, ELEMENT_LIC), ...validLiChildrenTypes];
  const [, liPath] = listItem;
  const liChildren = getChildren(listItem); // Get invalid (type) li children path refs to be moved

  const invalidLiChildrenPathRefs = liChildren.filter(([child]) => !allValidLiChildrenTypes.includes(child.type)).map(([, childPath]) => Editor.pathRef(editor, childPath));
  const firstLiChild = liChildren[0];
  const [firstLiChildNode, firstLiChildPath] = (_ref = firstLiChild) !== null && _ref !== void 0 ? _ref : []; // If li has no child or inline child, insert lic

  if (!firstLiChild || !Editor.isBlock(editor, firstLiChildNode)) {
    insertEmptyElement(editor, getPlatePluginType(editor, ELEMENT_LIC), {
      at: liPath.concat([0])
    });
    return true;
  } // If first li child is a block but not lic, set it to lic


  if (Editor.isBlock(editor, firstLiChildNode) && !match(firstLiChildNode, {
    type: getPlatePluginType(editor, ELEMENT_LIC)
  })) {
    if (match(firstLiChildNode, {
      type: getListTypes(editor)
    })) {
      // the listItem has no lic so we move the children up a level
      const parent = getParent(editor, listItem[1]);
      const sublist = firstLiChild;
      const children = getChildren(firstLiChild).reverse();
      children.forEach(c => {
        moveListItemUp(editor, {
          list: sublist,
          listItem: c
        });
      });
      Transforms.removeNodes(editor, {
        at: [...parent[1], 0]
      });
      return true;
    } // Allow block elements listed as valid li children types to be a first child instead of LIC


    if (validLiChildrenTypes.includes(firstLiChildNode.type)) {
      return true;
    }

    setNodes(editor, {
      type: getPlatePluginType(editor, ELEMENT_LIC)
    }, {
      at: firstLiChildPath
    });
    changed = true;
  }

  const licChildren = getChildren(firstLiChild);

  if (licChildren.length) {
    var _licChildren;

    const blockPathRefs = [];
    const inlineChildren = []; // Check that lic has no block children

    for (const licChild of licChildren) {
      if (!Editor.isBlock(editor, licChild[0])) {
        break;
      }

      blockPathRefs.push(Editor.pathRef(editor, licChild[1]));
      inlineChildren.push(...getDeepInlineChildren(editor, {
        children: getChildren(licChild)
      }));
    }

    const to = Path.next((_licChildren = licChildren[licChildren.length - 1]) === null || _licChildren === void 0 ? void 0 : _licChildren[1]); // Move lic nested inline children to its children

    inlineChildren.reverse().forEach(([, path]) => {
      Transforms.moveNodes(editor, {
        at: path,
        to
      });
    }); // Remove lic block children

    blockPathRefs.forEach(pathRef => {
      const path = pathRef.unref();
      path && Transforms.removeNodes(editor, {
        at: path
      });
    });

    if (blockPathRefs.length) {
      changed = true;
    }
  }

  if (changed) return true; // Ensure that any text nodes under the list are inside the list item container

  invalidLiChildrenPathRefs.reverse().forEach(ref => {
    const path = ref.unref();
    path && Transforms.moveNodes(editor, {
      at: path,
      to: firstLiChildPath.concat([0])
    });
  });
  return !!invalidLiChildrenPathRefs.length;
};

// should be normalized to "ul -> li -> lic + ul".
// In other words, a nested list as a direct children of a list should be moved into a previous list item sibling

const normalizeNestedList = (editor, {
  nestedListItem
}) => {
  const [, path] = nestedListItem;
  const parentNode = getParent(editor, path);
  const hasParentList = parentNode && match(parentNode[0], {
    type: getListTypes(editor)
  });

  if (!hasParentList) {
    return false;
  }

  let previousListItemPath;

  try {
    previousListItemPath = Path.previous(path);
  } catch (e) {
    return false;
  } // Previous sibling is the new parent


  const previousSiblingItem = Editor.node(editor, previousListItemPath);

  if (previousSiblingItem) {
    const [, previousPath] = previousSiblingItem;
    const newPath = previousPath.concat([1]); // Move the current item to the sublist

    Transforms.moveNodes(editor, {
      at: path,
      to: newPath
    });
    return true;
  }
};

/**
 * Normalize list node to force the ul>li>p+ul structure.
 */

const getListNormalizer = (editor, {
  validLiChildrenTypes
}) => {
  const {
    normalizeNode
  } = editor;
  const liType = getPlatePluginType(editor, ELEMENT_LI);
  const licType = getPlatePluginType(editor, ELEMENT_LIC);
  const defaultType = getPlatePluginType(editor, ELEMENT_DEFAULT);
  return ([node, path]) => {
    if (!isElement(node)) return; // remove empty list

    if (match(node, {
      type: getListTypes(editor)
    })) {
      if (!node.children.length || !node.children.find(item => item.type === liType)) {
        return Transforms.removeNodes(editor, {
          at: path
        });
      }

      const nextPath = Path.next(path);
      const nextNode = getNode(editor, nextPath); // Has a list afterwards with the same type

      if ((nextNode === null || nextNode === void 0 ? void 0 : nextNode.type) === node.type) {
        moveListItemsToList(editor, {
          fromList: [nextNode, nextPath],
          toList: [node, path],
          deleteFromList: true
        });
      }

      const prevPath = getPreviousPath(path);
      const prevNode = getNode(editor, prevPath); // Has a list before with the same type

      if ((prevNode === null || prevNode === void 0 ? void 0 : prevNode.type) === node.type) {
        editor.normalizeNode([prevNode, prevPath]); // early return since this node will no longer exists

        return;
      }

      if (normalizeNestedList(editor, {
        nestedListItem: [node, path]
      })) {
        return;
      }
    }

    if (node.type === getPlatePluginType(editor, ELEMENT_LI)) {
      if (normalizeListItem(editor, {
        listItem: [node, path],
        validLiChildrenTypes
      })) {
        return;
      }
    } // LIC should have LI parent. If not, set LIC to DEFAULT type.


    if (node.type === licType && licType !== defaultType) {
      var _getParent;

      if (((_getParent = getParent(editor, path)) === null || _getParent === void 0 ? void 0 : _getParent[0].type) !== liType) {
        setNodes(editor, {
          type: defaultType
        }, {
          at: path
        });
        return;
      }
    }

    normalizeNode([node, path]);
  };
};

const withList = ({
  validLiChildrenTypes
} = {}) => editor => {
  const {
    insertBreak,
    deleteBackward,
    deleteForward,
    deleteFragment
  } = editor;

  editor.insertBreak = () => {
    if (getListInsertBreak(editor)) return;
    insertBreak();
  };

  editor.deleteBackward = unit => {
    if (getListDeleteBackward(editor, unit)) return;
    deleteBackward(unit);
  };

  editor.deleteForward = unit => {
    if (getListDeleteForward(editor)) return;
    deleteForward(unit);
  };

  editor.deleteFragment = () => {
    if (getListDeleteFragment(editor)) return;
    deleteFragment();
  };

  editor.insertFragment = getListInsertFragment(editor);
  editor.normalizeNode = getListNormalizer(editor, {
    validLiChildrenTypes
  });
  return editor;
};

/**
 * Enables support for bulleted, numbered and to-do lists.
 */

const createListPlugin = options => ({
  pluginKeys: KEYS_LIST,
  renderElement: getRenderElement(KEYS_LIST),
  deserialize: getListDeserialize(),
  onKeyDown: getListOnKeyDown(KEYS_LIST),
  withOverrides: withList(options)
});

const CLASS_TODO_LIST_CHECKED = 'slate-TodoListElement-rootChecked';

const ELEMENT_TODO_LI = 'action_item';
const DEFAULTS_TODO_LIST = {
  hotkey: ['mod+opt+4', 'mod+shift+4']
};

const getTodoListDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, ELEMENT_TODO_LI);
  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: el => ({
        type: options.type,
        checked: el.classList.contains(CLASS_TODO_LIST_CHECKED)
      }),
      rules: [{
        className: getSlateClass(options.type)
      }]
    })
  };
};

const createTodoListPlugin = () => ({
  pluginKeys: ELEMENT_TODO_LI,
  renderElement: getRenderElement(ELEMENT_TODO_LI),
  deserialize: getTodoListDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_TODO_LI)
});

export { CLASS_TODO_LIST_CHECKED, DEFAULTS_TODO_LIST, ELEMENT_LI, ELEMENT_LIC, ELEMENT_OL, ELEMENT_TODO_LI, ELEMENT_UL, KEYS_LIST, createListPlugin, createTodoListPlugin, getDeepInlineChildren, getHighestEmptyList, getListDeleteBackward, getListDeleteForward, getListDeleteFragment, getListDeserialize, getListInsertBreak, getListInsertFragment, getListItemEntry, getListNormalizer, getListOnKeyDown, getListRoot, getListTypes, getTodoListDeserialize, hasListChild, indentListItems, insertListItem, isAcrossListItems, isListNested, moveListItemDown, moveListItemSublistItemsToListItemSublist, moveListItemUp, moveListItems, moveListItemsToList, moveListSiblingsAfterCursor, normalizeListItem, normalizeNestedList, removeFirstListItem, removeListItem, toggleList, unindentListItems, unwrapList, withList };
//# sourceMappingURL=index.es.js.map
