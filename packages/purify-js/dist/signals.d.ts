/**
 * Represents an object with a value that can be followed for changes.
 *
 * @template T The type of the value.
 *
 * @example
 * const signal = ref(0);
 * signal.follow((value) => console.log(value), true); // logs: 0
 * signal.val = 1; // logs: 1
 */
export interface SignalLike<T> {
    readonly val: T;
    follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower;
}
/**
 * Abstract class for signals that can be followed and derived from.
 *
 * @template T The type of the value.
 *
 * @example
 * const signal = ref(10);
 * const derived = signal.derive(val => val * 2);
 * console.log(derived.val); // logs: 20
 */
export declare abstract class Signal<T> implements SignalLike<T> {
    abstract get val(): T;
    abstract follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower;
    /**
     * Derives a new signal based on the current signal.
     *
     * @template U The type of the derived value.
     * @param getter A function that computes the derived value from the original value.
     * @returns A new derived signal.
     *
     * @example
     * const signal = ref(10);
     * const derivedSignal = signal.derive(value => value + 5);
     * console.log(derivedSignal.val); // logs: 15
     */
    derive<U>(getter: (value: T) => U): Signal.Computed<U>;
}
export declare namespace Signal {
    /**
     * A function that is called when the signal's value changes.
     *
     * @template T The type of the signal value.
     */
    export type Follower<T> = {
        (value: T): unknown;
    };
    /**
     * A function to stop following a signal.
     */
    export type Unfollower = {
        (): void;
    };
    const FOLLOWERS: unique symbol;
    /**
     * A signal whose value can be updated.
     *
     * @template T The type of the value.
     *
     * @example
     * const state = new Signal.State(0);
     * state.follow(val => console.log(val)); // logs: 0
     * state.val = 42; // logs: 42
     */
    export class State<T> extends Signal<T> {
        #private;
        [FOLLOWERS]: Set<Follower<T>>;
        constructor(initial: T);
        get val(): T;
        set val(newValue: T);
        /**
         * Allows a function to follow changes to the signal's value.
         *
         * @param follower A function to be called when the value changes.
         * @param immediate Whether to call the follower immediately with the current value.
         * @returns A function to unfollow the signal.
         *
         * @example
         * const state = new Signal.State(10);
         * const unfollow = state.follow(val => console.log(val), true); // logs: 10
         * state.val = 20; // logs: 20
         * unfollow(); // stops following
         */
        follow(follower: Follower<T>, immediate?: boolean): Signal.Unfollower;
        emit(): void;
    }
    export namespace Computed {
        type Getter<T> = (add: AddDependency) => T;
        type AddDependency = <T extends SignalLike<unknown>>(newDependency: T) => T;
    }
    /**
     * A signal that computes its value from other signals.
     *
     * @template T The type of the computed value.
     *
     * @example
     * const signal1 = ref(10);
     * const signal2 = ref(20);
     * const computedSignal = computed([signal1, signal2], () => signal1.val + signal2.val);
     * console.log(computedSignal.val); // logs: 30
     */
    export class Computed<T> extends Signal<T> {
        #private;
        constructor(getter: Computed.Getter<T>);
        get val(): T;
        /**
         * Follows changes to the computed signal.
         *
         * @param follower A function to be called when the value changes.
         * @param immediate Whether to call the follower immediately with the current value.
         * @returns A function to unfollow the signal.
         *
         * @example
         * const signal = ref(5);
         * const computedSignal = computed([signal], () => signal.val * 2);
         * computedSignal.follow(val => console.log(val), true); // logs: 10
         * signal.val = 6; // logs: 12
         */
        follow(follower: Follower<T>, immediate?: boolean): Signal.Unfollower;
    }
    export {};
}
/**
 * Creates a new state signal with an initial value.
 *
 * @template T The type of the value.
 * @param value The initial value of the signal.
 * @returns A new signal with the given initial value.
 *
 * @example
 * const count = ref(0);
 * console.log(count.val); // logs: 0
 * count.val = 5;
 * console.log(count.val); // logs: 5
 */
export declare let ref: <T>(value: T) => Signal.State<T>;
/**
 * Creates a new computed signal from other signals.
 *
 * @template T The type of the computed value.
 * @param dependencies The signals that the computed signal depends on.
 * @param getter A function that computes the value based on the dependencies.
 * @returns A new computed signal.
 *
 * @example
 * const a = ref(1);
 * const b = ref(2);
 * const sum = computed([a, b], () => a.val + b.val);
 * console.log(sum.val); // logs: 3
 */
export declare let computed: <T>(getter: Signal.Computed.Getter<T>) => Signal.Computed<T>;
/**
 * Creates a new signal that will resolve with the result of a promise.
 *
 * @template T The type of the resolved value.
 * @template U The type of the initial value (usually `null`).
 * @param promise The promise that will resolve the value.
 * @param until The initial value before the promise resolves.
 * @returns A signal that updates when the promise resolves.
 *
 * @example
 * const dataSignal = awaited(fetchDataPromise, null);
 * dataSignal.follow(data => console.log(data)); // logs the resolved data when ready
 */
export declare let awaited: <T, const U = null>(promise: Promise<T>, until?: U) => Signal<T | U>;
