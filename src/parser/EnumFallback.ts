
import { DecodeContext, EncodeContext, Parser } from "../Parser";
import { decodeIndex, encodeIndex, hashStr, stringSort } from "../Util";
import { StringParser } from "./String";



export class EnumFallbackParser<T extends string[]> extends Parser<T[keyof T] | string> {
    public readonly magic: number;
    public readonly values: T;

    public constructor(values: [...T]) {
        super();
        this.values = values.toSorted((a, b) => stringSort(a, b)) as T;
        this.magic = hashStr(`EnumFallbackParser:${this.values.join(',')}`);
    }

    public encodeInternal(ctx: EncodeContext, value: T[keyof T] | string): void {
        const index = this.values.findIndex(v => v == value);
        if(index === -1) {
            ctx.bitField.putBit(false);
            ctx.encode(new StringParser(), value as string);
        } else {
            ctx.bitField.putBit(true);
            encodeIndex(ctx, index, this.values.length);
        }
    }

    public decodeInternal(ctx: DecodeContext): T[keyof T] | string {
        if(ctx.bitField.getBit()) {
            const index = decodeIndex(ctx, this.values.length) as keyof T;
            return this.values[index];
        } else {
            return ctx.decode(new StringParser());
        }
    }
}


