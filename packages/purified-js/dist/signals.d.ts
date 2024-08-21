/**
 * A Signal class that represents a reactive value.
 * @template T - The type of the signal's value.
 */
export declare class Signal<T = unknown> {
    #private;
    /**
     * Constructs a new Signal instance.
     * @param initial - The initial value of the signal.
     */
    constructor(initial: T, starter?: Signal.Starter<T>);
    protected set(value: T, self?: this): void;
    /**
     * Gets the current value of the signal.
     * @returns The current value of the signal.
     */
    get val(): T;
    /**
     * Follows the signal's value changes and calls the provided follower function.
     * @param follower - The function to be called when the signal's value changes.
     * @param immediate - If true, the follower function will be called immediately with the initial value.
     * @returns An object that can be used to unfollow the signal.
     */
    follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower;
    /**
     * Notifies all followers of the signal to update their values.
     */
    notify(): void;
}
export declare namespace Signal {
    type Cleanup = {
        (): unknown;
    };
    type Starter<T> = {
        (set: Setter<T>): void | Cleanup;
    };
    /**
     * A type representing a function that sets a value.
     * @template T - The type of the value to be set.
     */
    type Setter<T> = {
        (value: T): void;
    };
    /**
     * A type representing a function that gets a value.
     * @template T - The type of the value to be retrieved.
     */
    type Getter<T> = {
        (): T;
    };
    /**
     * A type representing a function that follows a signal's value changes.
     * @template T - The type of the signal's value.
     */
    type Follower<T> = {
        (value: T): unknown;
    };
    /**
     * A type representing an object that can be used to unfollow a signal.
     */
    type Unfollower = {
        (): void;
    };
    /**
     * A Signal subclass that represents a mutable reactive value.
     * @template T - The type of the signal's value.
     */
    class State<T> extends Signal<T> {
        /**
         * Gets the current value of the signal.
         * @returns The current value of the signal.
         */
        get val(): T;
        /**
         * Sets the current value of the signal.
         * @param value - The new value of the signal.
         */
        set val(value: T);
    }
    /**
     * A Signal subclass that represents a computed value.
     * @template T - The type of the signal's value.
     */
    class Compute<T> extends Signal<T> {
        #private;
        constructor(callback: Signal.Compute.Callback<T>);
        get val(): T;
    }
    namespace Compute {
        /**
         * A type representing a function that computes a value.
         * @template T - The type of the computed value.
         */
        type Callback<T> = {
            (): T;
        };
    }
}
/**
 * Creates a new State signal with the provided initial value.
 * @template T - The type of the signal's value.
 * @param value - The initial value of the signal.
 * @returns A new State signal.
 * @example
 * const count = ref(0);
 */
export declare let ref: <T>(initial: T, starter?: Signal.Starter<T> | undefined) => Signal.State<T>;
/**
 * Creates a new Compute signal that computes its value using the provided callback function.
 * @template T - The type of the signal's value.
 * @param callback - The function to compute the signal's value.
 * @returns A new Compute signal.
 * @example
 * const doubleCount = computed(() => count.val * 2);
 */
export declare let computed: <T>(callback: Signal.Compute.Callback<T>) => Signal.Compute<T>;
/**
 * Creates a new Signal that resolves its value when the provided promise resolves.
 * @template T - The type of the promise's resolved value.
 * @template U - The type of the until value.
 * @param promise - The promise to await.
 * @param until - The value to resolve the signal with when the promise is not yet resolved.
 * @returns A new Signal that resolves its value when the provided promise resolves.
 * @example
 * const data = awaited(fetchData());
 */
export declare let awaited: <T, const U = null>(promise: Promise<T>, until?: U) => Signal<T | U>;
/**
 * Creates an effect that reactively calls the provided callback function.
 * @template T - The type of the signal's value.
 * @param callback - The function to call when the signal's value changes.
 * @returns An object that can be used to stop the effect.
 * @example
 * effect(() => console.log(count.val));
 */
export declare let effect: <T>(callback: Signal.Compute.Callback<T>) => Signal.Unfollower;
