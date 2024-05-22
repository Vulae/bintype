
import { DecodeContext, EncodeContext, Parser, ParserType } from "../Parser";
import { hashStr } from "../Util";



type TupleParserType<T extends Parser<any>[]> = {
    [K in keyof T]: ParserType<T[K]>;
}

export class TupleParser<T extends Parser<any>[]> extends Parser<TupleParserType<T>> {
    public readonly magic: number;
    public readonly elementTypes: T;

    public constructor(elementTypes: [...T]) {
        super();
        this.elementTypes = elementTypes;
        this.magic = hashStr(`TupleParser:${this.elementTypes.map(t => t.magic).join(',')}`);
    }

    public encodeInternal(ctx: EncodeContext, tuple: TupleParserType<T>): void {
        for(let i = 0; i < tuple.length; i++) {
            ctx.encode(this.elementTypes[i], tuple[i]);
        }
    }

    public decodeInternal(ctx: DecodeContext): TupleParserType<T> {
        // TODO: Probably make this type safe.
        let tuple: any[] = [];
        for(let i = 0; i < this.elementTypes.length; i++) {
            tuple.push(ctx.decode(this.elementTypes[i]));
        }
        return tuple as any;
    }
}


