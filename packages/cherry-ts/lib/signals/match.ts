import { FOLLOW, FOLLOW_IMMEDIATE_OPTIONS, UNFOLLOW } from "../helpers"
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
                undefined,
                (set, currentIndex = -1) =>
                    valueSignal[FOLLOW]((value) => {
                        if (currentIndex >= 0 && guards[currentIndex]!.fn(value)) return

                        for (let i = 0; i < guards.length; i++) {
                            if (i !== currentIndex) {
                                let guard = guards[i]!
                                if (guard.fn(value)) {
                                    currentIndex = i
                                    return set(guard.then(valueSignal))
                                }
                            }
                        }
                        currentIndex = -1

                        return set(fallback?.(valueSignal))
                    }, FOLLOW_IMMEDIATE_OPTIONS)[UNFOLLOW],
            ),
    } as never)
