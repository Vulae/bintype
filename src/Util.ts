
import { IO } from "./IO";
import { DecodeContext, EncodeContext } from "./Parser";



export function hashStr(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
}



export function hex(value: number, byteLength: number, start: string = '0x'): string {
    return start + value.toString(16).padStart(byteLength * 2, '0');
}



export function stringSort(a: string, b: string): number {
    return (a > b ? 1 : 0) - (a < b ? 1 : 0);
}





// 
// BigInt encoding is as follows:
// 
// UNSIGNED: 0bNNNNNNNX[n]
// SIGNED:   0bNNNNNNSX[0], 0bNNNNNNNX[n]
// 
// Where X is extension bit, if this is set there is another byte in the array.
// Where N is the underlying number bits that is directly set in the bigint number.
// Where S is the signedness of the bigint.
// 
// WARNING: This encoding of bigint allows for -0 to exist.
// TODO: Make flag bits the most significant bits instead of least.
// 

export function encodeBigInt(value: bigint, signed: boolean, io: IO): void {
    const negative: boolean = (value < 0n);

    if(negative) {
        if(!signed) {
            throw new Error('Cannot encode negative bigint when parser is not signed.');
        }
        value = -value;
    }

    // Encode first byte
    if(!signed) {
        io.putByte(
            Number((value & 0b01111111n) << 1n) |
            ((value > 0b01111111n) ? 0b00000001 : 0b00000000)
        );
        value >>= 7n;
    } else {
        io.putByte(
            Number((value & 0b00111111n) << 2n) |
            (negative ? 0b00000010 : 0b00000000) |
            ((value > 0b00111111n) ? 0b00000001 : 0b00000000)
        );
        value >>= 6n;
    }

    // Encode rest bytes
    while(value > 0n) {
        io.putByte(
            Number((value & 0b01111111n) << 1n) |
            ((value > 0b01111111n) ? 0b00000001 : 0b00000000)
        );
        value >>= 7n;
    }
}

export function decodeBigInt(signed: boolean, io: IO): bigint {
    // Decode first byte
    let byte: number = io.getByte();
    let value: bigint = !signed ? (BigInt(byte & 0b11111110) >> 1n) : (BigInt(byte & 0b11111100) >> 2n);
    const negative: boolean = !signed ? false : ((byte & 0b00000010) ? true : false);
    let shift: number = !signed ? 7 : 6;

    // Decode rest bytes
    while(byte & 0b00000001) {
        byte = io.getByte();
        value |= BigInt((byte & 0b11111110) >> 1) << BigInt(shift);
        shift += 7;
    }

    return !negative ? value : -value;
}



// 
// Encode an index into a small size.
// If length is 0, uses 0 bits.
// If length is 1, uses 0 bits.
// If length is 2, uses 1 bit.
// if length > 2, uses multiple bytes.
// 

export function encodeIndex(ctx: EncodeContext, index: number, length: number): void {
    if(length < 0) {
        throw new Error('EncodeIndex invalid length.');
    }
    if(index < 0 || index >= length) {
        throw new Error('EncodeIndex out of bounds.');
    }
    if(length <= 1) return;
    if(length == 2) {
        ctx.bitField.putBit(index === 1);
        return;
    }
    encodeBigInt(BigInt(index), false, ctx.body);
}

export function decodeIndex(ctx: DecodeContext, length: number): number {
    if(length < 0) {
        throw new Error('DecodeIndex invalid length.');
    }
    let index: number;
    if(length <= 1) {
        index = 0;
    } else if(length == 2) {
        index = ctx.bitField.getBit() ? 1 : 0;
    } else {
        index = Number(decodeBigInt(false, ctx.body));
    }
    if(index < 0 || index >= length) {
        throw new Error('DecodeIndex out of bounds.');
    }
    return index;
}


