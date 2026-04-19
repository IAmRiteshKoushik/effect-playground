import { Either, ParseResult, Schema } from "effect";

const MetadataSchemaV1 = Schema.Struct({
  version: Schema.Literal(1),
  width: Schema.NonNaN.pipe(Schema.compose(Schema.Int), Schema.positive()),
  height: Schema.NonNaN.pipe(Schema.compose(Schema.Int), Schema.positive()),
});

const MetadataSchemaV2 = Schema.Struct({
  version: Schema.Literal(1),
  width: Schema.NonNaN.pipe(Schema.compose(Schema.Int), Schema.positive()),
  height: Schema.NonNaN.pipe(Schema.compose(Schema.Int), Schema.positive()),
  depth: Schema.NonNaN.pipe(Schema.compose(Schema.Int), Schema.positive()),
});

const JsonSchema = Schema.transformOrFail(Schema.String, Schema.Unknown, {
  decode: (input, _options, ast) => ParseResult.try({
    try: () => JSON.parse(input),
    catch: (error) => new ParseResult.Type(
      ast,
      input,
      error instanceof Error ? error.message : "Failed to parse JSON"
    ),
  }),
  encode: (input, _options, ast) =>
    ParseResult.try({
      try: () => JSON.stringify(input),
      catch: (error) => new ParseResult.Type(
        ast,
        input,
        error instanceof Error ? error.message : "Failed to stringify JSON"
      )
    })
});

const result = Schema.decodeEither(JsonSchema)('{ "foo": "bar" }');
if (Either.isRight(result)) {
  console.log(result.right);

  // JSONify
  const encoded = Schema.encodeEither(JsonSchema)(result.right);
  if (Either.isRight(encoded)) {
    console.log(encoded.right);
  } else {
    console.error(encoded.left.message);
  }
}

const ComposedSchema = JsonSchema.pipe(Schema.compose(Schema.Union(MetadataSchemaV1, MetadataSchemaV2)))
if (Either.isLeft(result)) {
  console.log(result.left.message);
} else {
  console.log(result.right);
}

const newResult = Schema.decodeEither(ComposedSchema)(`{ "width": 100.5, "height": 200 , version: 1 }`);
if (Either.isLeft(newResult)) {
  console.log(newResult.left.message);
} else {
  console.log(newResult.right)
}
