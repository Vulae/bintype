
import { DecodeContext, EncodeContext, Parser } from "../Parser";
import { hashStr } from "../Util";
import { BigIntParser } from "./BigInt";



export class DateParser extends Parser<Date> {
    public readonly magic: number = hashStr('DateParser');

    public encodeInternal(ctx: EncodeContext, date: Date): void {
        ctx.encode(new BigIntParser(false), BigInt(date.valueOf()));
    }

    public decodeInternal(ctx: DecodeContext): Date {
        return new Date(Number(ctx.decode(new BigIntParser(false))));
    }
}


