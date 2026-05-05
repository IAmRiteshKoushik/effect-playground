import { Pretty, Schema } from "effect";

const Person = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

const PersonPretty = Pretty.make(Person)

console.log(PersonPretty({ name: "Alice", age: 30 }))
