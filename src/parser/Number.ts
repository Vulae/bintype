
import { DecodeContext, EncodeContext, Parser } from "../Parser";
import { hashStr } from "../Util";



export class NumberParser<
    T extends 'u8' | 'u16' | 'u32' | 'u64' | 'i8' | 'i16' | 'i32' | 'i64' | 'f32' | 'f64',
    N extends (T extends 'u64' | 'i64' ? bigint : number) = (T extends 'u64' | 'i64' ? bigint : number)
> extends Parser<N> {
    public readonly magic: number;
    public readonly type: T;

    public constructor(type: T) {
        super();
        this.type = type;
        this.magic = hashStr(`NumberParser:${this.type}`);
    }

    // TypeScript has forced my hands! Why wont this narrow the number type!
    public encodeInternal(ctx: EncodeContext, number: N): void {
        ctx.body.expect(8);
        switch(this.type) {
            case 'u8': ctx.body.view.setUint8(ctx.body.pointer, number as number); ctx.body.pointer += 1; break;
            case 'u16': ctx.body.view.setUint16(ctx.body.pointer, number as number, true); ctx.body.pointer += 2; break;
            case 'u32': ctx.body.view.setUint32(ctx.body.pointer, number as number, true); ctx.body.pointer += 4; break;
            case 'u64': ctx.body.view.setBigUint64(ctx.body.pointer, number as bigint, true); ctx.body.pointer += 8; break;
            case 'i8': ctx.body.view.setInt8(ctx.body.pointer, number as number); ctx.body.pointer += 1; break;
            case 'i16': ctx.body.view.setInt16(ctx.body.pointer, number as number, true); ctx.body.pointer += 2; break;
            case 'i32': ctx.body.view.setInt32(ctx.body.pointer, number as number, true); ctx.body.pointer += 4; break;
            case 'i64': ctx.body.view.setBigInt64(ctx.body.pointer, number as bigint, true); ctx.body.pointer += 8; break;
            case 'f32': ctx.body.view.setFloat32(ctx.body.pointer, number as number, true); ctx.body.pointer += 4; break;
            case 'f64': ctx.body.view.setFloat64(ctx.body.pointer, number as number, true); ctx.body.pointer += 8; break;
            default: throw new Error('NumParser invalid type.');
        }
    }

    public decodeInternal(ctx: DecodeContext): N {
        let number: N;
        switch(this.type) {
            case 'u8': number = ctx.body.view.getUint8(ctx.body.pointer) as N; ctx.body.pointer += 1; break;
            case 'u16': number = ctx.body.view.getUint16(ctx.body.pointer, true) as N; ctx.body.pointer += 2; break;
            case 'u32': number = ctx.body.view.getUint32(ctx.body.pointer, true) as N; ctx.body.pointer += 4; break;
            case 'u64': number = ctx.body.view.getBigUint64(ctx.body.pointer, true) as N; ctx.body.pointer += 8; break;
            case 'i8': number = ctx.body.view.getInt8(ctx.body.pointer) as N; ctx.body.pointer += 1; break;
            case 'i16': number = ctx.body.view.getInt16(ctx.body.pointer, true) as N; ctx.body.pointer += 2; break;
            case 'i32': number = ctx.body.view.getInt32(ctx.body.pointer, true) as N; ctx.body.pointer += 4; break;
            case 'i64': number = ctx.body.view.getBigInt64(ctx.body.pointer, true) as N; ctx.body.pointer += 8; break;
            case 'f32': number = ctx.body.view.getFloat32(ctx.body.pointer, true) as N; ctx.body.pointer += 4; break;
            case 'f64': number = ctx.body.view.getFloat64(ctx.body.pointer, true) as N; ctx.body.pointer += 8; break;
            default: throw new Error('NumParser invalid type.');
        }
        return number;
    }
}


