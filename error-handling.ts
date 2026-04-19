import { Console, Effect } from "effect";

class FooError {
  readonly _tag = "FooError"
}

class BarError {
  readonly _tag = "BarError"
}

const conditions = [true, true, true] as [boolean, boolean, boolean];

const errors = Effect.gen(function*() {
  if (conditions[0]) {
    yield* Effect.fail(new FooError());
  } else if (conditions[1]) {
    yield* Effect.fail(new BarError());
  } else if (conditions[2]) {
    // This is an unexpected error. This is the equivalent of a panic 
    // statement. Effect.die terminates the fiber with a specified error
    // You cannot cast it into the <A, E, R> setup, E = never
    yield* Effect.die("boom");
  }

  return "Success";
});

const program = Effect.gen(function*() {
  yield* Console.log(1)
  yield* Effect.fail(new Error("boom"))
  yield* Console.log("2")
});

const handle1 = errors.pipe(
  Effect.catchAll((e) => Effect.succeed(`Handled ${e._tag}`))
);

// catch all takes a function that takes the error and returns a new effect,
// either suceeding with a value of failing with the error
const handle2 = errors.pipe(
  Effect.catchTag("FooError", (e) => Effect.succeed("Handled Foo"))
);

// Handling multiple tagged errors at the same time
const handle3 = errors.pipe(
  Effect.catchTags({
    FooError: (e) => Effect.succeed("Handled Foo"),
    BarError: (e) => Effect.succeed("Handled Bar"),
  })
);

// some more combinators for handling errors

const handle4 = errors.pipe(
  Effect.orElse(() => Effect.succeed("Handled"))
);

const handle5 = errors.pipe(
  Effect.orElseFail(() => new Error("fail"))
);


