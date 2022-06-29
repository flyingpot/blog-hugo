import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import React from 'react';
import { isCollapsed, createNodeHOC, createNodesHOC } from '@udecode/plate-common';
import { useEditorState } from '@udecode/plate-core';
import { Editor } from 'slate';
import { useFocused, useSelected } from 'slate-react';

const getPlaceholderStyles = props => createStyles({
  prefixClassNames: 'Placeholder',
  ...props
}, {
  root: props.enabled && css(["::before{content:attr(placeholder);opacity:0.3;", "}"], {
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
  const focused = useFocused();
  const selected = useSelected();
  const editor = useEditorState();
  const isEmptyBlock = Editor.isEmpty(editor, element);
  const enabled = isEmptyBlock && (!hideOnBlur || isCollapsed(editor.selection) && hideOnBlur && focused && selected);
  return React.Children.map(children, child => {
    return /*#__PURE__*/React.cloneElement(child, {
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
const withPlaceholder = createNodeHOC(Placeholder);
const withPlaceholders = createNodesHOC(Placeholder);

export { Placeholder, getPlaceholderStyles, withPlaceholder, withPlaceholders };
//# sourceMappingURL=index.es.js.map
