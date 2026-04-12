// A tag is a way to discriminate two types

type One = {
  readonly _tag: "One"
  readonly foo: string
}

type Two = {
  readonly _tag: "Two"
  readonly foo: string
}

type Union = One | Two;

declare const union: Union

switch (union._tag) {
  case "One":
    console.log(union.foo)
    break
  case "Two":
    console.log(union.foo)
    break
}
