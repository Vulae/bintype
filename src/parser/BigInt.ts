
import { DecodeContext, EncodeContext, Parser } from "../Parser";
import { decodeBigInt, encodeBigInt, hashStr } from "../Util";



export class BigIntParser extends Parser<bigint> {
    public readonly magic: number;
    public readonly signed: boolean;

    public constructor(signed: boolean) {
        super();
        this.signed = signed;
        this.magic = hashStr(`BigIntParser:${this.signed ? 'Signed' : 'Unsigned'}`);
    }

    public encodeInternal(ctx: EncodeContext, value: bigint): void {
        encodeBigInt(value, this.signed, ctx.body);
    }

    public decodeInternal(ctx: DecodeContext): bigint {
        return decodeBigInt(this.signed, ctx.body);
    }
}


