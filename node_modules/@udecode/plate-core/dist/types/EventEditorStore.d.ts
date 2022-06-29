import { EditorId } from './PlateStore';
export declare type EditorEvent = 'blur' | 'focus';
export declare type EventEditorState = Partial<Record<EditorEvent, EditorId>>;
export declare type EventEditorActions = {
    setEventEditorId: (event: EditorEvent, value: EditorId) => void;
};
//# sourceMappingURL=EventEditorStore.d.ts.map