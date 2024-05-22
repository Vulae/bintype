


const IO_DEFAULT_EXPECTED_LENGTH = 1024;
const IO_EXPECT_EXTRA_SIZE = 1024;



abstract class BaseIO {
    public buffer: ArrayBuffer;
    public length: number = 0;

    private _pointer: number = 0;
    public set pointer(pointer: number) {
        if(pointer > this.length) {
            this.length = pointer;
        }
        this._pointer = pointer;
    }
    public get pointer(): number {
        return this._pointer;
    }

    public get view(): DataView { return new DataView(this.buffer); }

    public constructor(expectedLength?: number);
    public constructor(buffer: ArrayBuffer);
    public constructor(a: number | ArrayBuffer = IO_DEFAULT_EXPECTED_LENGTH) {
        if(typeof a == 'number') {
            this.length = 0;
            this.buffer = new ArrayBuffer(a);
        } else {
            this.length = a.byteLength;
            this.buffer = a;
        }
    }

    /** The final output of written data. */
    public final(): ArrayBuffer {
        return this.buffer.slice(0, this.length);
    }

    /** Expand buffer size to number of bytes past pointer if needed. */
    public expect(bytes: number): void {
        if(this.buffer.byteLength < (this.pointer + bytes)) {
            const expanded = new Uint8Array(this.buffer.byteLength + bytes + IO_EXPECT_EXTRA_SIZE);
            expanded.set(new Uint8Array(this.buffer), 0);
            this.buffer = expanded.buffer;
        }
    }
}



export class IO extends BaseIO {
    public getByte(): number {
        return this.view.getUint8(this.pointer++);
    }

    public getBuffer(length: number): ArrayBuffer {
        const slice = this.buffer.slice(this.pointer, this.pointer + length);
        this.pointer += length;
        return slice;
    }

    public putByte(byte: number): void {
        this.expect(1);
        this.view.setUint8(this.pointer++, byte);
    }

    public putBuffer(buffer: ArrayBuffer): void {
        this.expect(buffer.byteLength);
        new Uint8Array(this.buffer).set(new Uint8Array(buffer), this.pointer);
        this.pointer += buffer.byteLength;
    }



    public withholdByte(): (byte: number) => void {
        const pointer = this.pointer++;
        return byte => this.view.setUint8(pointer, byte);
    }
}



export class BitIO extends BaseIO {
    public set pointer(pointer: number) {
        this._bitPointer = 0;
        super.pointer = pointer;
    }
    public get pointer(): number { return super.pointer; }

    private _bitPointer: number = 0;
    public set bitPointer(bitPointer: number) {
        if(bitPointer < 8) {
            this._bitPointer = bitPointer;
        } else {
            this.pointer += (bitPointer >> 3);
            this._bitPointer = bitPointer & 0b111;
        }
    }
    public get bitPointer(): number { return this._bitPointer; }

    public flush(): void {
        if(this.bitPointer == 0) return;
        this.bitPointer = 0;
        this.pointer++;
    }

    public final(): ArrayBuffer {
        this.flush();
        return super.final();
    }

    public putBit(set: boolean): void {
        this.expect(1);
        // FIXME: This does not overwrite any already set bits.
        this.view.setUint8(this.pointer, this.view.getUint8(this.pointer) | ((set ? 1 : 0) << this.bitPointer++));
    }

    public getBit(): boolean {
        return (this.view.getUint8(this.pointer) & (1 << this.bitPointer++)) ? true : false;
    }



    public putBits(value: number, numBits: number): void {
        for(let i = 0; i < numBits; i++) {
            this.putBit(((value >> i) & 0b1) ? true : false);
        }
    }

    public getBits(numBits: number): number {
        let value: number = 0;
        for(let i = 0; i < numBits; i++) {
            value |= (this.getBit() ? 1 : 0) << i;
        }
        return value;
    }
}


