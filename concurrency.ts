import { Console, Effect, Schedule } from "effect";

const effect = Effect.gen(function*(_) {
  let i = 0;
  yield* _(
    Effect.suspend(() => Console.log("i", i)),
    Effect.repeat(Schedule.spaced(250)),
    Effect.fork
  );

  while (true) {
    yield* Effect.sync(() => i++);
  }
});
