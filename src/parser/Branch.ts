
import { DecodeContext, EncodeContext, Parser, ParserType } from "../Parser";
import { decodeIndex, encodeIndex, hashStr, stringSort } from "../Util";
import { BigIntParser } from "./BigInt";



type BranchParserType<T extends {[key: string]: Parser<any>}> = {
    [K in keyof T]: [ K, ParserType<T[K]> ];
}[keyof T];

export class BranchParser<T extends {[key: string]: Parser<any>}> extends Parser<BranchParserType<T>> {
    public readonly magic: number;
    public readonly branchTypes: {
        [K in keyof T]: [ K, T[K] ];
    }[keyof T][];

    public constructor(branchTypes: T) {
        super();
        // @ts-ignore
        this.branchTypes = Object.entries(branchTypes).toSorted(([ key1 ], [ key2 ]) => stringSort(key1, key2));
        // @ts-ignore - FIXME
        this.magic = hashStr(`BranchParser:${this.branchTypes.map(([ key, type ]) => `${key}-${type.magic}`).join(',')}`);
    }

    public encodeInternal(ctx: EncodeContext, data: BranchParserType<T>): void {
        const keyIndex = this.branchTypes.findIndex(([ key ]) => key == data[0]);
        if(keyIndex === -1) {
            throw new Error('BranchParser: Failed to find key index.');
        }
        encodeIndex(ctx, keyIndex, this.branchTypes.length);
        ctx.encode(this.branchTypes[keyIndex][1], data[1]);
    }

    public decodeInternal(ctx: DecodeContext): BranchParserType<T> {
        const keyIndex = decodeIndex(ctx, this.branchTypes.length);
        return [ this.branchTypes[keyIndex][0], ctx.decode(this.branchTypes[keyIndex][1]) ];
    }
}


