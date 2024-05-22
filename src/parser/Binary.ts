
import { DecodeContext, EncodeContext, Parser } from "../Parser";
import { hashStr } from "../Util";
import { BigIntParser } from "./BigInt";



export class BinaryParser extends Parser<ArrayBuffer> {
    public readonly magic: number = hashStr('BinaryParser');

    public encodeInternal(ctx: EncodeContext, buffer: ArrayBuffer): void {
        ctx.encode(new BigIntParser(false), BigInt(buffer.byteLength));
        ctx.body.putBuffer(buffer);
    }

    public decodeInternal(ctx: DecodeContext): ArrayBuffer {
        const length: number = Number(ctx.decode(new BigIntParser(false)));
        return ctx.body.getBuffer(length);
    }
}


