import { Either, Schema } from "effect";

const TrimmedString = Schema.transform(Schema.String, Schema.String, {
  decode: (x) => x.trim(),
  encode: (x) => x,
});

const MySimpleSchema = Schema.Struct({
  id: Schema.String,
  title: TrimmedString.pipe(
    Schema.minLength(4, {
      message: (parseIssue) => `Value must be at least 4 characters long, got ${parseIssue.actual}`,
    })
  ),
  isActive: Schema.Boolean
});

const x = Schema.decode(MySimpleSchema)({
  id: "1",
  title: "My first schema",
  isActive: false
});

const y = Schema.decodeUnknown(MySimpleSchema)({
  id: "1",
  title: "My first schema",
});

// Returns - Either<A, E> = Left<E, A> | Right<A, E>
const z = Schema.decodeUnknownEither(MySimpleSchema)({
  id: "1",
  title: " He",
  isActive: false
});

// if (Either.isLeft(z)) {
//   console.error("Error")
//   console.error(z.left)
// } else {
//   console.log("Success")
//   console.log(z.right)
// }

const msg = Either.match(z, {
  onLeft: (left) => left.message,
  onRight: (right) => right
});

console.log(msg)
