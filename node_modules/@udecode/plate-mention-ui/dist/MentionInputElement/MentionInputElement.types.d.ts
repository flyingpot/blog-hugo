import { MentionNode, MentionNodeData } from '@udecode/plate-mention';
import { StyledElementProps } from '@udecode/plate-styled-components';
export interface MentionInputElementStyleProps extends MentionInputElementProps {
    selected?: boolean;
    focused?: boolean;
}
export interface MentionInputElementProps extends Omit<StyledElementProps<MentionNode>, 'onClick'> {
    /**
     * Prefix rendered before mention
     */
    prefix?: string;
    onClick?: (mentionNode: MentionNode) => void;
    renderLabel?: (mentionable: MentionNodeData) => string;
}
//# sourceMappingURL=MentionInputElement.types.d.ts.map