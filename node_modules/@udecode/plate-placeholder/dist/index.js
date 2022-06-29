'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateStyledComponents = require('@udecode/plate-styled-components');
var styledComponents = require('styled-components');
var React = require('react');
var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');
var slate = require('slate');
var slateReact = require('slate-react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const getPlaceholderStyles = props => plateStyledComponents.createStyles({
  prefixClassNames: 'Placeholder',
  ...props
}, {
  root: props.enabled && styledComponents.css(["::before{content:attr(placeholder);opacity:0.3;", "}"], {
    "display": "block",
    "position": "absolute",
    "cursor": "text"
  })
});

const Placeholder = props => {
  const {
    children,
    element,
    placeholder,
    hideOnBlur = true,
    nodeProps
  } = props;
  const focused = slateReact.useFocused();
  const selected = slateReact.useSelected();
  const editor = plateCore.useEditorState();
  const isEmptyBlock = slate.Editor.isEmpty(editor, element);
  const enabled = isEmptyBlock && (!hideOnBlur || plateCommon.isCollapsed(editor.selection) && hideOnBlur && focused && selected);
  return React__default['default'].Children.map(children, child => {
    return /*#__PURE__*/React__default['default'].cloneElement(child, {
      className: child.props.className,
      nodeProps: { ...nodeProps,
        styles: getPlaceholderStyles({
          enabled,
          ...props
        }),
        placeholder
      }
    });
  });
};
const withPlaceholder = plateCommon.createNodeHOC(Placeholder);
const withPlaceholders = plateCommon.createNodesHOC(Placeholder);

exports.Placeholder = Placeholder;
exports.getPlaceholderStyles = getPlaceholderStyles;
exports.withPlaceholder = withPlaceholder;
exports.withPlaceholders = withPlaceholders;
//# sourceMappingURL=index.js.map
