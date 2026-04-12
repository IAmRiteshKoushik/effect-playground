import { Effect } from "effect";

// This only returns <A, never, never>
const successfulProgram = Effect.sync(() => {
  console.log("hi! I am successfulProgram");
  return 42;
});

// This returns <A, Error, never>
const failedProgram = Effect.try(() => {
  throw new Error("boom");
  return 42;
});

const asyncProgram = Effect.promise(() => Promise.resolve(42));

// Effect themselves are just values and do not do anything until you run them
console.log(successfulProgram);
console.log(failedProgram);
console.log("--------------------------------------------------")

// For managing successful ONLY programs
const result = Effect.runSync(successfulProgram)
console.log("runSync result:", result);
console.log("--------------------------------------------------")

// For managing code that can have failed cases
try {
  Effect.runSync(failedProgram)
} catch (error) {
  console.log("runSync error:", error)
}
console.log("--------------------------------------------------")

// For managing code that is async and can throw errors. (wrong way)
try {
  Effect.runSync(asyncProgram)
} catch (error) {
  console.log("runSync error for asyncProgram:", error)
}
console.log("This leads to a cryptic error")
console.log("--------------------------------------------------")

// For managing code that is async and can throw errors. (wrong way)
Effect.runPromise(asyncProgram).then((result) => {
  console.log("runPromise result:", result);
  console.log("--------------------------------------------------")
});

Effect.runPromise(failedProgram).catch((error) => {
  console.log("runPromise result:", result)
  console.log("--------------------------------------------------")
});

// Quick Note: Promises take time to resolve as they are offloaded to 
// separate threads/workers and hence, the rest of the program executes 
// before they return back with resolve / reject.

// An Exit reprents a construct that captures both 
// Success<A> and Failure<Cause<E>>
const _exit = Effect.runSyncExit(failedProgram)

const _promisifiedExit = Effect.runPromiseExit(asyncProgram)
