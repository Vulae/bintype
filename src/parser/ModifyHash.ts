
import { DecodeContext, EncodeContext, Parser, ParserType } from "../Parser";
import { hashStr } from "../Util";



export class ModifyHashParser<P extends Parser<any>> extends Parser<ParserType<P>> {
    public readonly magic: number;
    public readonly modifier: string;
    public readonly parser: P;

    constructor(modifier: string, parser: P) {
        super();
        this.modifier = modifier;
        this.parser = parser;
        this.magic = hashStr(`ModifyHashParser:${this.parser.magic}:${this.modifier}`);
    }

    public encodeInternal(ctx: EncodeContext, value: ParserType<P>): void {
        ctx.encode(this.parser, value);
    }
    
    public decodeInternal(ctx: DecodeContext): ParserType<P> {
        return ctx.decode(this.parser);
    }
}


