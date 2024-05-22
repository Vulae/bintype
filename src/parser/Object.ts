
import { DecodeContext, EncodeContext, Parser, ParserType } from "../Parser";
import { hashStr } from "../Util";



export class ObjectParser<O extends {[key: string]: Parser<any>}> extends Parser<{[key in keyof O]: ParserType<O[key]>}> {
    public readonly magic: number;
    public readonly objType: O;
    public readonly keys: (keyof O)[];

    public constructor(objType: O) {
        super();
        this.objType = objType;
        this.keys = (Object.keys(this.objType) as (keyof O)[]).toSorted();
        this.magic = hashStr(`StringParser:${this.keys.map(key => `${String(key)}-${this.objType[key].magic}`).join(',')}`);
    }

    public encodeInternal(ctx: EncodeContext, obj: { [key in keyof O]: ParserType<O[key]>; }): void {
        for(const key of this.keys) {
            ctx.encode(this.objType[key], obj[key]);
        }
    }

    public decodeInternal(ctx: DecodeContext): { [key in keyof O]: ParserType<O[key]>; } {
        let obj: {[key in keyof O]?: ParserType<O[key]>} = {};
        for(const key of this.keys) {
            obj[key] = ctx.decode(this.objType[key]);
        }
        return obj as {[key in keyof O]: ParserType<O[key]>};
    }
}


