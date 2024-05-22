
import { DecodeContext, EncodeContext, Parser } from "../Parser";
import { decodeIndex, encodeIndex, hashStr, stringSort } from "../Util";



export class EnumParser<T extends string[] | number[]> extends Parser<T[keyof T]> {
    public readonly magic: number;
    public readonly values: T;

    public constructor(values: [...T]) {
        super();
        this.values = values.toSorted((a, b) => stringSort(String(a), String(b))) as T;
        this.magic = hashStr(`EnumParser:${this.values.join(',')}`);
    }

    public encodeInternal(ctx: EncodeContext, value: T[keyof T]): void {
        const index = this.values.findIndex(v => v == value);
        if(index === -1) {
            throw new Error('BranchByKeyParser: Failed to find key index.');
        }
        encodeIndex(ctx, index, this.values.length);
    }

    public decodeInternal(ctx: DecodeContext): T[keyof T] {
        const index = decodeIndex(ctx, this.values.length) as keyof T;
        return this.values[index];
    }
}


