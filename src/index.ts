


import { Parser, ParserType, EncodeContext, DecodeContext } from "./Parser";
export { Parser, ParserType, EncodeContext, DecodeContext };

import { IO, BitIO } from "./IO";
export { IO, BitIO };

import { hashStr, stringSort, encodeBigInt, decodeBigInt, encodeIndex, decodeIndex } from "./Util";
export { hashStr, stringSort, encodeBigInt, decodeBigInt, encodeIndex, decodeIndex };



import { ModifyHashParser } from "./parser/ModifyHash";
export { ModifyHashParser };
/**
 * Modifies the hash of the input parser.
 * @param modifier String modifier.
 * @param parser Parser to modify hash of.
 */
export function modifyhash<P extends Parser<any>>(modifier: string, parser: P): ModifyHashParser<P> {
    return new ModifyHashParser(modifier, parser);
}

import { BigIntParser } from "./parser/BigInt";
export { BigIntParser };
/**
 * Store any size bigint.
 * Will throw if parser is trying to parse negative bigint while parser is unsigned.
 * @param signed If bigint is signed.
 */
export function bigint(signed: boolean): BigIntParser {
    return new BigIntParser(signed);
}

import { BinaryParser } from "./parser/Binary";
export { BinaryParser };
/**
 * Store any size array buffer.
 */
export function binary(): BinaryParser {
    return new BinaryParser();
}

import { NumberParser } from "./parser/Number";
export { NumberParser };
/**
 * Stores a number.
 * @param type Number representation to store.
 */
export function number<T extends 'u8' | 'u16' | 'u32' | 'u64' | 'i8' | 'i16' | 'i32' | 'i64' | 'f32' | 'f64'>(type: T): NumberParser<T> {
    return new NumberParser(type);
}

import { StringParser } from "./parser/String";
export { StringParser };
/**
 * Stores a string.
 */
export function string(): StringParser {
    return new StringParser();
}

import { BooleanParser } from "./parser/Boolean";
export { BooleanParser };
/**
 * Stores a boolean.
 */
export function boolean(): BooleanParser {
    return new BooleanParser();
}

import { NullableParser } from "./parser/Nullable";
export { NullableParser };
/**
 * Makes type nullable.
 * @param type Type to make nullable.
 */
export function nullable<T extends Parser<any>>(type: T): NullableParser<T> {
    return new NullableParser(type);
}

import { ObjectParser } from "./parser/Object";
export { ObjectParser };
/**
 * Stores multiple types with keys.
 * @param objType Object parser map to store.
 */
export function object<O extends {[key: string]: Parser<any>}>(objType: O): ObjectParser<O> {
    return new ObjectParser(objType);
}

import { ArrayParser } from "./parser/Array";
export { ArrayParser };
/**
 * Stores type as an array.
 * @param type Array type.
 */
export function array<A extends Parser<any>>(type: A): ArrayParser<A> {
    return new ArrayParser(type);
}

import { MapParser } from "./parser/Map";
export { MapParser as RecordParser };
/**
 * Stores a key value map.
 * @param keyType Key type.
 * @param valueType Value type.
 */
export function map<K extends Parser<string | number>, V extends Parser<any>>(keyType: K, valueType: V): MapParser<K, V> {
    return new MapParser(keyType, valueType);
}

import { DateParser } from "./parser/Date";
export { DateParser };
/**
 * Stores a date.
 */
export function date(): DateParser {
    return new DateParser();
}

import { TupleParser } from "./parser/Tuple";
export { TupleParser };
/**
 * Stores a tuple of types.
 * @param tupleTypes Tuple array of types.
 */
export function tuple<T extends Parser<any>[]>(tupleTypes: [...T]): TupleParser<T> {
    return new TupleParser(tupleTypes);
}

import { BranchParser } from "./parser/Branch";
export { BranchParser as OrParser };
/**
 * Branch parser type by value.
 * @param branchTypes Branch value type map.
 */
export function branch<T extends {[key: string]: Parser<any>}>(branchTypes: T): BranchParser<T> {
    return new BranchParser(branchTypes);
}

import { BranchByKeyParser } from "./parser/BranchByKey";
export { BranchByKeyParser };
/**
 * Branch parser type by object key.
 * @param key Key that stores the type branch.
 * @param branchTypeMap Type branch map, The key names are used as branch names.
 */
export function branchByKey<
    K extends string,
    O extends {
        [key: string]: {[key: string]: Parser<any>}
    }
>(key: K, branchTypeMap: O): BranchByKeyParser<K, O> {
    return new BranchByKeyParser(key, branchTypeMap);
}

import { EnumParser } from "./parser/Enum";
export { EnumParser };
/**
 * Store an enum.
 * @param values Possible enum values.
 */
function _enum<T extends string[] | number[]>(values: [...T]): EnumParser<T> {
    return new EnumParser(values);
}
export { _enum as enum };


