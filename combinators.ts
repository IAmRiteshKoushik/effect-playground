// Do not run effects inside other effects. Effects are to 
// be run only on the EDGES / call-sites of your program.

// For example, when we want to transform data through a series of functions
import { Console, Effect, pipe } from "effect";

const getDate = () => Date.now()
const double = (x: number) => x * 2;
const toString = (x: number) => x.toString();
const toUpperCase = (x: string) => x.toUpperCase()

const program = () => pipe(getDate(), double, toString, toUpperCase)

// pipe is a function that takes a value and a list of functions 
// and applies the functions to the value in order
// notice how it looks almost identical to the method syntax

// Pipe functions must be unary, this is because the output of one function 
// becomes the input of the next one so if a function takes more than 
// one argument, you need to partially apply fixes

{
  const getDate = Effect.sync(() => Date.now());
  const double = (x: number) => x * 2;

  const doubleDate = Effect.sync(() => {
    const date = Effect.runSync(getDate)
    return double(date)
  });

  // do NOT do this ...
  // running effects should be at the edges of your program where the effect 
  // interacts with the outside world. This is because runSync assumes that 
  // the function would not fail and if it does so, then the entire thing 
  // collapses

  // This does not work as the return value of getDate is 
  // an Effect<A, E, R> which cannot be passed to a double
  // const doubleDate2 = pipe(getDate, double)

  const doubleDate3 = Effect.map(getDate, (x) => double(x));
  // map() will take an effect and operate on the type of the Value of that 
  // effect, which is A.

  // So effectively, we can do something like this
  const program = pipe(
    getDate,
    Effect.map((x) => x * 2),
    Effect.map((x) => x.toString()),
    Effect.map((x) => x.toUpperCase()),
  );

  const result = Effect.runSync(program);
  // But notice, initially in effect.Map we were passing the getDate but 
  // we did not do that in the second time. This is because the map() function 
  // has two overloads
  // 1. Data-first
  // 2. Data-last

  // So effectively what happens is that a function is returned which accepts 
  // an effect and returns an effect. That is how they work in the pipe() 
  // example under the hood.
  const _ = Effect.map((x: number) => double(x))
  const __ = Effect.map((x: number) => x.toString())(getDate)
}

{
  // This function returns an effect of a number or an error.
  const divide = (a: number, b: number): Effect.Effect<number, Error> =>
    b === 0
      ? Effect.fail(new Error("Cannot divide by 0"))
      : Effect.succeed(a / b)

  // This is a problem because this is an effect whose success value itself 
  // is an effect of an effect. Which is a problem.
  // This result is Effect<Effect<number, Error, never>, never, never>
  const program = pipe(
    Effect.succeed([25, 5] as const),
    Effect.map(([a, b]) => divide(a, b))
  );

  // This result is Effect<number, Error, never> 
  // This has flattened the nested effects and takes the type of the 
  // final effect that is part of the pipe
  const program2 = pipe(
    Effect.succeed([25, 5] as const),
    Effect.flatMap(([a, b]) => divide(a, b))
  );

  // Now, if you want a side-effect while piping, then one way is to 
  // do this
  const program3 = pipe(
    Effect.sync(() => Date.now()),
    Effect.map((x) => x * 2),
    Effect.map((x) => {
      console.log(x)
      return x // if this is not done, it returns a void
    }),
    Effect.map((x) => x.toString()),
    Effect.map((x) => x.toUpperCase())
  );

  // So, we have Effect.tap() which is used only for side-effect
  const program4 = pipe(
    Effect.sync(() => Date.now()),
    Effect.map((x) => x * 2),
    Effect.tap((x) => console.log(x)), // side-effect ONLY
    Effect.map((x) => x.toString()),
    Effect.map((x) => x.toUpperCase())
  );

  // How to combine effects ? 
  const getDate = Effect.sync(() => Date.now());
  const yesterday = Effect.sync(() => Date.now() - 24 * 60 * 60 * 1000);
  const both = Effect.all([getDate, yesterday]);
  const program5 = pipe(
    both,
    Effect.map(([x, y]) => x + y)
  );

  // You can even do this with objects instead of using tuples
  const bothAlt = Effect.all({ x: getDate, y: yesterday })
  const program5Alt = pipe(
    bothAlt,
    Effect.map(({ x, y }) => x + y)
  );
}

{
  const divide = (a: number, b: number): Effect.Effect<number, Error> =>
    b === 0
      ? Effect.fail(new Error("Cannot divide by 0"))
      : Effect.succeed(a / b)

  // The previous pipe() syntax looks awfully similar to promise chaining. 
  // So obviously, there is an async / await way of doing it :)
  const after = Effect.gen(function*(_) {
    const x = yield* _(Effect.sync(() => Date.now()))
    const y = x * 2;
    const z = yield* _(divide(y, 3));

    // Errors propagate automatically to the return type
    return z.toString();
  });
  // This has a few interesting properties. If there is an error, we need 
  // not explicitly handle it. When we are using the yield keyword then 
  // the if there is an error generated, that has automatically propagated 
  // to the generator function. The variables only store Value<A>

  // This means that you do not have to manually inspect and return the 
  // error at every point (like Golang). We can just do happy path 
  // programming and the errors are automatically propagated

  // Another piece of context is that the "_" is actually the Adapter. It 
  // is not some syntactic sugar. If you see the argument of the 
  // function that is being added after Effect.gen() then you will notice 
  // this. You can change it for anything else too, but this is idiomatic

  // NOTE: Effect does not need the adapter anymore. In the new update, you 
  // can yield* normally

  const latest = Effect.gen(function*() {
    const x = yield* Effect.sync(() => Date.now());
    const y = x * 2;
    const z = yield* divide(y, 3);

    return z.toString();
  })
}

// Some more on the pipe method
{
  const after = Effect.succeed(5).pipe(
    Effect.map((x) => x * 2),
    Effect.map((x) => x.toString()),
  );

  // There are also the zip functions (very much from functional programming)
  // These are fairly esoteric and I do not seem them being used that actively
  // 1. Tuple of 2 effects
  const zipped = Effect.zip(Effect.succeed("hi"), Effect.succeed(10));
  // 2. zipping effects from left to right and vice-versa
  const zipLeft = Effect.zipLeft(Effect.succeed("hi"), Effect.succeed(10));
  const zipRight = Effect.zipLeft(Effect.succeed("hi"), Effect.succeed(10));
}

{
  const foo = Effect.succeed(5);

  const seven = Effect.andThen(foo, "hi");
  const eight = Effect.andThen(foo, Promise.resolve("hi"));
  const nine = Effect.andThen(foo, (x) => `hi ${x}`);
  const ten = Effect.andThen(foo, (x) => Promise.resolve(`hi ${x}`))
  const eleven = Effect.andThen(foo, (x) => Console.log(`hi ${x}`))

  // Anecdote: The sync() functions that are chained are trusted not to throw 
  // errors, but the async() functions are not. If you inspect the type 
  // then you will see UnknownException as the Error type
}
