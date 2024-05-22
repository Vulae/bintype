
import { DecodeContext, EncodeContext, Parser } from "../Parser";
import { hashStr } from "../Util";



export class BooleanParser extends Parser<boolean> {
    public readonly magic: number = hashStr('BooleanParser');

    public encodeInternal(ctx: EncodeContext, value: boolean): void {
        ctx.bitField.putBit(value);
    }
    
    public decodeInternal(ctx: DecodeContext): boolean {
        return ctx.bitField.getBit();
    }
}


