
import { DecodeContext, EncodeContext, Parser } from "../Parser";
import { hashStr } from "../Util";
import { BinaryParser } from "./Binary";



export class StringParser extends Parser<string> {
    public readonly magic: number = hashStr('StringParser');

    public encodeInternal(ctx: EncodeContext, str: string): void {
        ctx.encode(new BinaryParser(), new TextEncoder().encode(str));
    }

    public decodeInternal(ctx: DecodeContext): string {
        return new TextDecoder('utf-8').decode(ctx.decode(new BinaryParser()));
    }
}


