import { Either, Schema } from "effect";

const MySchema = Schema.transform(Schema.String, Schema.NonNaN, {
  decode: (input) => Number(input),
  encode: (input) => input.toString(),
});

const result = Schema.decodeEither(MySchema)("123");

if (Either.isRight(result)) {
  console.log(result.right);
} else {
  console.log(result.left.message);
}
