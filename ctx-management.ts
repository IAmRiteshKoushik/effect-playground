import type { Effect } from "effect";

interface RandomImpl {
  readonly next: Effect.Effect<number>;
}
