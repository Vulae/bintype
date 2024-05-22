
import Pako from "pako";
import { BitIO, IO } from "./IO";
import { decodeBigInt, encodeBigInt, hex } from "./Util";





function compress(data: ArrayBuffer): ArrayBuffer {
    return Pako.deflateRaw(data).buffer;
}

function decompress(data: ArrayBuffer): ArrayBuffer {
    return Pako.inflateRaw(data).buffer;
}





export type ParserType<P extends Parser<any>> = P extends Parser<infer T> ? T : never;

export abstract class Parser<T> {
    public abstract readonly magic: number;

    public abstract encodeInternal(ctx: EncodeContext, value: T): void;
    public abstract decodeInternal(ctx: DecodeContext): T;

    /**
     * Encode the value into binary data.
     */
    public encode(value: T, options: EncodeContextOptions = { }): ArrayBuffer {
        const ctx: EncodeContext = new EncodeContext(this, options);
        ctx.encode(this, value as ParserType<this>);
        return ctx.final();
    }

    /**
     * Decode binary data into the value.
     */
    public decode(buffer: ArrayBuffer): T {
        const ctx: DecodeContext = new DecodeContext(this, buffer);
        return ctx.decode(this);
    }
}





interface ContextBase {
    readonly baseType: Parser<any>;
    readonly bitField: BitIO;
    readonly body: IO;
}

const FLAG_BODY_COMPRESSED: number = 0b00000001;
const FLAG_BITFIELD_COMPRESSED: number = 0b00000010;

export interface EncodeContextOptions {
    /**
     * If data may be compressed 
     * @default true 
     */
    readonly compressed?: boolean;
    /**
     * If set, data will ALWAYS be compressed. Whereas if not set, data may not be compressed if compressed data is larger than uncompressed. 
     * @default false 
     */
    readonly forceCompressed?: boolean;
}

export class EncodeContext implements ContextBase {
    public readonly baseType: Parser<any>;

    public readonly bitField: BitIO = new BitIO();
    public readonly body: IO = new IO();

    public readonly compressed: boolean;
    public readonly forceCompressed: boolean;

    public constructor(baseType: Parser<any>, options: EncodeContextOptions = { }) {
        this.baseType = baseType;
        this.compressed = options.compressed ?? true;
        this.forceCompressed = options.forceCompressed ?? false;
    }

    public compress(data: ArrayBuffer): { compressed: boolean, data: ArrayBuffer } {
        if(!this.compressed) {
            return { compressed: false, data };
        }
        const compressed = compress(data);
        if(compressed.byteLength < data.byteLength || this.forceCompressed) {
            return { compressed: true, data: compressed };
        }
        return { compressed: false, data };
    }

    public final(): ArrayBuffer {
        const data: IO = new IO();

        data.putBuffer(new Uint32Array([ this.baseType.magic ]).buffer);
        const putFlags = data.withholdByte();

        const { compressed: bitFieldCompressed, data: bitField } = this.compress(this.bitField.final());
        encodeBigInt(BigInt(bitField.byteLength), false, data);
        data.putBuffer(bitField);

        const { compressed: bodyCompressed, data: body } = this.compress(this.body.final());
        data.putBuffer(body);

        putFlags(
            (bodyCompressed ? FLAG_BODY_COMPRESSED : 0) |
            (bitFieldCompressed ? FLAG_BITFIELD_COMPRESSED : 0)
        );

        return data.final();
    }
    
    public encode<P extends Parser<any>>(type: P, value: ParserType<P>): void {
        type.encodeInternal(this, value);
    }
}

export class DecodeContext implements ContextBase {
    public readonly baseType: Parser<any>;

    public readonly bitField: BitIO;
    public readonly body: IO;

    public decompress(data: ArrayBuffer, compressed: boolean | number): ArrayBuffer {
        if(!compressed) return data;
        return decompress(data);
    }

    public constructor(baseType: Parser<any>, buffer: ArrayBuffer) {
        this.baseType = baseType;

        const header: IO = new IO(buffer);

        const magic: number = new Uint32Array(header.getBuffer(4))[0];
        if(magic != this.baseType.magic) {
            throw new Error(`ParserContext magic check failed. Expected ${hex(this.baseType.magic, 4)} Got ${hex(magic, 4)}`);
        }

        const flags: number = header.getByte();

        const bitFieldLength: number = Number(decodeBigInt(false, header));
        const bitField = this.decompress(header.getBuffer(bitFieldLength), flags & FLAG_BITFIELD_COMPRESSED);
        this.bitField = new BitIO(bitField);

        const body = this.decompress(header.getBuffer(header.length - header.pointer), flags & FLAG_BODY_COMPRESSED);
        this.body = new IO(body);
    }

    public decode<P extends Parser<any>>(type: P): ParserType<P> {
        return type.decodeInternal(this);
    }
}


