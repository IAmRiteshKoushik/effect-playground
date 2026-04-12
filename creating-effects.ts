import { Effect } from "effect";

// Creating effects from simple values. These are called as "Value" 
// constructors.
{
  // Effect<number, never, never>
  const one = Effect.succeed(1);
  // Effect<never, string, never>
  const two = Effect.fail("two");

  // Function argments are evaluated eagerly, when the effect is created. 
  // Only it's values and not the computations underneath it
  const bad = Effect.succeed(Date.now())
  // is equivalent to
  const now = Date.now();
  const getDate = () => now;
  const case1 = Effect.runSync(bad)
  const case2 = Effect.runSync(bad)
  console.log(case1 === case2); // returns true because value was pre-computed
  // This leads to costly mistakes when data/time entities are not calculated 
  // in the runtime and done during initialization

  // This breaks the core property of effect which is laziness. Effect is 
  // supposed to: describe work and not perform it. In this case, work 
  // has already happened. The timestamp is already computed and now only a 
  // constant value is being held inside the definition. The computation is 
  // not deferred.

  // Correct way to do it: Now, is it not run immediately. We can use the 
  // runSync() method to run it when we require it to.
  const good = Effect.sync(() => Date.now())
  const a = Effect.runSync(good)
  const b = Effect.runSync(good)
  console.log(a === b);
  // this would not be true because now, we are going to get two different 
  // dates but in the prevoius implementation, we would get the same thing
  // twice

  const sideEffectExample = Effect.sync(() => {
    console.log("side effect");
    return 2;
  });

  // This is a problem because it is an unexpected error and it is going to 
  // end the program
  const NEVER = Effect.sync(() => {
    throw new Error("will cause a defect")
  });

  // sync ASSUMES that the computation will NEVER throw and error. If it has 
  // to by any chance, then use Effect.try() 
  // The return type becomes Effect<number, UnknownException>
  const tryOne = Effect.try(() => {
    throw new Error("effect will catch this error and propagate it")
  });


  // Here, the return type is Effect<any, JsonParseError>
  class JsonParseError { }
  const tryTwo = Effect.try({
    try: () => JSON.parse("invalid json"),
    catch: (unknownError) => new JsonParseError()
  });
}

// Creating effects from asynchronous computations
{
  const wait = (ms: number): Promise<string> => new Promise((resolve) => setTimeout(() => resolve("resolved"), ms));

  // Effect<string, never>
  const one = Effect.promise(() => wait(1000));

  // Effect<string, UnknownException>
  const two = Effect.tryPromise(() => fetch("https://jsonplaceholder.typicode.com/todos/1"));

  const three = Effect.tryPromise({
    try: () => fetch("https://url.here"),
    catch: (unknown) => new Error(`something went wrong ${unknown}`)
  });
}

// Some async APIs are not promise based but callback based
import { readFile } from "node:fs";
{
  // readFileEffect: Effect<Buffer, NodeJS.ErrnoException>
  // type parameters are unable to be inferred, so you have to specify them
  const readFilesEffect = Effect.async<Buffer, NodeJS.ErrnoException>(
    (resume) => {
      readFile("package.json", (err, data) => {
        if (err) {
          resume(Effect.fail(err));
        } else {
          resume(Effect.succeed(data));
        }
      });
    }

  )
}
