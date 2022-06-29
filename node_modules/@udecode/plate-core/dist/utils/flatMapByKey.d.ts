declare type FlattenIfArray<T> = T extends (infer R)[] ? R : T;
/**
 * Flat map an array of object by key.
 */
export declare const flatMapByKey: <TItem, TKey extends keyof TItem>(arr: TItem[], key: TKey) => FlattenIfArray<NonNullable<TItem[TKey]>>[];
export {};
//# sourceMappingURL=flatMapByKey.d.ts.map