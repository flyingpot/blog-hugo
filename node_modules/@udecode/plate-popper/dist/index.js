'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var slateReact = require('slate-react');
var react = require('react');
var reactPopper = require('react-popper');

/**
 * Get bounding client rect by slate range
 */

const getRangeBoundingClientRect = (editor, at) => {
  if (!at) return;

  try {
    const domRange = slateReact.ReactEditor.toDOMRange(editor, at);
    return domRange.getBoundingClientRect();
  } catch (err) {}
};

/**
 * Get bounding client rect of the window selection
 */
const getSelectionBoundingClientRect = () => {
  const domSelection = window.getSelection();
  if (!domSelection || domSelection.rangeCount < 1) return;
  const domRange = domSelection.getRangeAt(0);
  return domRange.getBoundingClientRect();
};

const virtualReference = {
  getBoundingClientRect() {
    return {
      top: -9999,
      left: -9999,
      bottom: 9999,
      right: 9999,
      width: 90,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => null
    };
  }

};
/**
 * TODO: duplicate
 */

const usePopperPosition = ({
  popperElement,
  popperContainer = document,
  popperOptions = {},
  modifiers = [],
  offset = [0, 0],
  placement = 'auto',
  isHidden = false,
  getBoundingClientRect = getSelectionBoundingClientRect
}) => {
  const popperResult = reactPopper.usePopper(virtualReference, popperElement, {
    placement,
    modifiers: [// default modifiers to position the popper correctly
    {
      name: 'preventOverflow',
      enabled: true,
      options: {
        boundary: popperContainer
      }
    }, {
      name: 'flip',
      enabled: true,
      options: {
        padding: 8
      }
    }, {
      name: 'eventListeners',
      enabled: true,
      options: {
        scroll: !isHidden,
        resize: true
      }
    }, {
      name: 'offset',
      options: {
        offset
      }
    }, {
      name: 'computeStyles',
      options: {
        gpuAcceleration: false
      }
    }, // user modifiers to override the default
    ...modifiers],
    strategy: 'absolute',
    ...popperOptions
  });
  const {
    update,
    state
  } = popperResult;
  const isReady = !isHidden && !!state;
  const styles = isReady ? popperResult.styles : { ...popperResult.styles,
    popper: { ...popperResult.styles.popper,
      display: 'none'
    }
  };
  const updatePosition = react.useCallback(() => {
    if (isHidden) return;
    if (!popperElement) return;
    virtualReference.getBoundingClientRect = getBoundingClientRect;
    update === null || update === void 0 ? void 0 : update();
  }, [getBoundingClientRect, isHidden, popperElement, update]);
  react.useEffect(() => {
    updatePosition();
  }, [updatePosition]);
  react.useEffect(() => {
    popperContainer === null || popperContainer === void 0 ? void 0 : popperContainer.addEventListener('scroll', updatePosition);
    return () => popperContainer === null || popperContainer === void 0 ? void 0 : popperContainer.removeEventListener('scroll', updatePosition);
  }, [updatePosition, popperContainer]);
  return { ...popperResult,
    update: updatePosition,
    styles
  };
};

exports.getRangeBoundingClientRect = getRangeBoundingClientRect;
exports.getSelectionBoundingClientRect = getSelectionBoundingClientRect;
exports.usePopperPosition = usePopperPosition;
exports.virtualReference = virtualReference;
//# sourceMappingURL=index.js.map
