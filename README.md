
# [bintype](https://github.com/Vulae/bintype)
### A simple data storage binary schema.

# Usage

```TypeScript
// Import
import * as bt from "bintype";

// Define the schema
const MY_SCHEMA = /* bt.Parser type */

// Encode into binary data
const encoded: ArrayBuffer = MY_SCHEMA.encode(/* bt.ParserType<typeof MY_SCHEMA> */, {
    // If to compress data (default: true)
    compressed: true
});

// Decode from binary data
const decoded: bt.ParserType<typeof MY_SCHEMA> = MY_SCHEMA.decode(encoded);
```

# Examples

```TypeScript
import * as bt from "bintype";

```

```TypeScript
// array: define 1 parser to be an array.
const SCHEMA_BOOLEANS = bt.array(
    // boolean: stores 1 bit boolean value.
    bt.boolean()
);

const encodedBooleans = SCHEMA_BOOLEANS.encode([ false, false, true, false, false, true, false, false ])

console.log(SCHEMA_BOOLEANS.decode(encodedBooleans));
```

```TypeScript
// object: define multiple parsers by key
const SCHEMA_USER = bt.object({
    name: bt.string(),
    // nullable: makes underlying type nullable.
    bio: bt.nullable(bt.string()),
    createdAt: bt.date(),
    // enum: value must match any of the enum values.
    role: bt.enum([ 'user', 'moderator', 'administrator' ]),
    // enumFallback: provides a generic string fallback if enum does not match.
    pronouns: bt.enumFallback([ 'he/him', 'she/her', 'they/them' ]),
});

const encodedUser = SCHEMA_USER.encode({
    name: 'Vulae',
    bio: null,
    createdAt: new Date(),
    role: 'administrator',
    pronouns: 'they/them'
});

console.log(SCHEMA_USER.decode(encodedUser));
```

```TypeScript
// TODO: Example of branchByKey
```
