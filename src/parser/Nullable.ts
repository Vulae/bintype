
import { DecodeContext, EncodeContext, Parser, ParserType } from "../Parser";
import { hashStr } from "../Util";



export class NullableParser<T extends Parser<any>> extends Parser<ParserType<T> | null> {
    public readonly magic: number;
    public readonly type: T;

    public constructor(type: T) {
        super();
        this.type = type;
        this.magic = hashStr(`NullableParser:${this.type.magic}`);
    }

    public encodeInternal(ctx: EncodeContext, value: ParserType<T> | null): void {
        if(value !== null) {
            ctx.bitField.putBit(true);
            ctx.encode(this.type, value);
        } else {
            ctx.bitField.putBit(false);
        }
    }

    public decodeInternal(ctx: DecodeContext): ParserType<T> | null {
        if(ctx.bitField.getBit()) {
            return ctx.decode(this.type);
        } else {
            return null;
        }
    }
}


