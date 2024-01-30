import { FOLLOW, FOLLOW_IMMEDIATE_OPTIONS, UNDEFINED, UNFOLLOW } from "../helpers"
import type { Utils } from "../utils"
import type { Signal, SignalLike } from "./signal"
import { signal, signalFrom } from "./signal"

type Exhaust<T, U> = Exclude<T, U>

type MatchBuilder<TValue, TReturns = never> = {
    case<TGuardType, TResult>(
        guard: Utils.ValueGuard<TGuardType>,
        then: (value: Signal<Utils.Narrow<TValue, TGuardType>>) => TResult,
    ): MatchBuilder<Exhaust<TValue, TGuardType>, TReturns | TResult>
} & MatchBuilder.Default<TValue, TReturns>
namespace MatchBuilder {
    export type Default<TValue, TReturns> = [TValue] extends [never]
        ? {
              default(): Signal<TReturns>
          }
        : {
              default<TDefault>(
                  fallback: (value: Signal<TValue>) => TDefault,
              ): Signal<TReturns | TDefault>
          }
}

export let match: {
    <TValue>(valueSignalOrFn: SignalLike<TValue>): MatchBuilder<TValue>
} = <TValue>(
    valueSignalOrFn: SignalLike<TValue>,
    guards: {
        fn: Utils.ValueGuard<unknown>
        then: (value: Signal<TValue>) => unknown
    }[] = [],
    valueSignal = signalFrom(valueSignalOrFn),
    self: MatchBuilder<TValue> = 0 as never,
): MatchBuilder<TValue> =>
    (self = {
        case: (
            guard: Utils.ValueGuard<unknown>,
            then: (value: Signal<TValue>) => unknown,
        ) => (guards.push({ fn: guard, then }), self),
        default: (fallback?: (value: Signal<TValue>) => unknown) =>
            signal<unknown>(
                UNDEFINED,
                (set, currentIndex = -1) =>
                    valueSignal[FOLLOW](
                        (value) =>
                            (currentIndex >= 0 && guards[currentIndex]!.fn(value)) ||
                            guards.find(
                                (guard, i) =>
                                    i !== currentIndex &&
                                    guard.fn(value) &&
                                    ((currentIndex = i),
                                    set(guard.then(valueSignal)),
                                    !0),
                            ) ||
                            ((currentIndex = -1), set(fallback?.(valueSignal))),
                        FOLLOW_IMMEDIATE_OPTIONS,
                    )[UNFOLLOW],
            ),
    } as never)
