
import { DecodeContext, EncodeContext, Parser, ParserType } from "../Parser";
import { hashStr } from "../Util";
import { BigIntParser } from "./BigInt";



export class ArrayParser<A extends Parser<any>> extends Parser<ParserType<A>[]> {
    public readonly magic: number;
    public readonly arrType: A;

    public constructor(arrType: A) {
        super();
        this.arrType = arrType;
        this.magic = hashStr(`ArrayParser:${this.arrType.magic}`);
    }

    public encodeInternal(ctx: EncodeContext, arr: ParserType<A>[]): void {
        ctx.encode(new BigIntParser(false), BigInt(arr.length));
        for(const item of arr) {
            ctx.encode(this.arrType, item);
        }
    }
    
    public decodeInternal(ctx: DecodeContext): ParserType<A>[] {
        const length = Number(ctx.decode(new BigIntParser(false)));
        const arr: ParserType<A>[] = [];
        for(let i = 0; i < length; i++) {
            arr.push(ctx.decode(this.arrType));
        }
        return arr;
    }
}


