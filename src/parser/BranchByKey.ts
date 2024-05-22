
import { DecodeContext, EncodeContext, Parser, ParserType } from "../Parser";
import { decodeIndex, encodeIndex, hashStr, stringSort } from "../Util";
import { BigIntParser } from "./BigInt";
import { ObjectParser } from "./Object";



/*
    TODO: Don't allow defining key property on object in parser type map.
    Eg:
        ```TypeScript
        branchByKey('type', {
            error: {
                severity: number('i32')
                message: string()
            },
            message: {
                type: string(), // <--- Should error here because type is being used for branch.
                message: string()
            }
        })
        ```
*/



type BranchByKeyParserType<
    K extends string,
    O extends {[key: string]: {[key: string]: Parser<any>}}
> = {
    [I in keyof O]: {
        [J in keyof O[I]]: ParserType<O[I][J]>;
    } & {
        [_ in K]: I;
    };
}[keyof O];

export class BranchByKeyParser<
    K extends string,
    O extends {
        [key: string]: {[key: string]: Parser<any>}
    }
> extends Parser<BranchByKeyParserType<K, O>> {
    public readonly magic: number;
    public readonly key: K;
    public readonly branchTypes: {
        [K in keyof O]: [ K, Parser<{[I in keyof O[K]]: O[K][I]}> ];
    }[keyof O][];

    public constructor(key: K, branchTypeMap: O) {
        super();
        this.key = key;
        // @ts-ignore
        this.branchTypes = Object.entries(branchTypeMap)
            .toSorted(([ key1 ], [ key2 ]) => stringSort(key1, key2))
            .map(([ key, obj ]) => {
            if(this.key in obj) {
                throw new Error(`BranchByKeyParser: Key is included in parser map, remove key ${key}.${this.key}`);
            }
            return [ key, new ObjectParser(obj) ];
        });
        // @ts-ignore - FIXME
        this.magic = hashStr(`BranchByKeyParser:${this.key}:${this.branchTypes.map(([ key, type ]) => `${key}-${type.magic}`).join(',')}`);
    }

    public encodeInternal(ctx: EncodeContext, value: BranchByKeyParserType<K, O>): void {
        const keyIndex = this.branchTypes.findIndex(([ key ]) => key == value[this.key]);
        if(keyIndex === -1) {
            throw new Error('BranchByKeyParser: Failed to find key index.');
        }
        encodeIndex(ctx, keyIndex, this.branchTypes.length);
        ctx.encode(this.branchTypes[keyIndex][1], value); // FIXME: value[this.key] should maybe be deleted?
    }

    public decodeInternal(ctx: DecodeContext): BranchByKeyParserType<K, O> {
        const keyIndex = decodeIndex(ctx, this.branchTypes.length);
        // @ts-ignore
        return {
            ...ctx.decode(this.branchTypes[keyIndex][1]),
            [this.key]: this.branchTypes[keyIndex][0]
        }
    }
}


