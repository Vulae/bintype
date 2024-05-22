
import { DecodeContext, EncodeContext, Parser, ParserType } from "../Parser";
import { hashStr } from "../Util";
import { BigIntParser } from "./BigInt";



export class MapParser<K extends Parser<string | number>, V extends Parser<any>> extends Parser<Map<ParserType<K>, ParserType<V>>> {
    public readonly magic: number;
    public readonly keyType: K;
    public readonly valueType: V;

    public constructor(keyType: K, valueType: V) {
        super();
        this.keyType = keyType;
        this.valueType = valueType;
        this.magic = hashStr(`MapParser:${this.keyType.magic}-${this.valueType.magic}`);
    }

    // TODO: Allow Record<ParserType<K>, ParserType<V>> as an argument
    public encodeInternal(ctx: EncodeContext, map: Map<ParserType<K>, ParserType<V>>): void {
        ctx.encode(new BigIntParser(false), BigInt(map.size));
        for(const [ key, value ] of map.entries()) {
            ctx.encode(this.keyType, key);
            ctx.encode(this.valueType, value);
        }
    }

    public decodeInternal(ctx: DecodeContext): Map<ParserType<K>, ParserType<V>> {
        const map: Map<ParserType<K>, ParserType<V>> = new Map();
        const size = Number(ctx.decode(new BigIntParser(false)));
        for(let i = 0; i < size; i++) {
            const key = ctx.decode(this.keyType);
            const value = ctx.decode(this.valueType);
            map.set(key, value);
        }
        return map;
    }
}


