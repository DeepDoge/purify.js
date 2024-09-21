export declare namespace Signal {
    type Cleanup = {
        (): unknown;
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
}
export declare abstract class Signal<T> {
    #private;
    abstract get val(): T;
    protected start(): Signal.Cleanup | void;
    protected track(): void;
    follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower;
    emit(value?: T): void;
}
export declare namespace Signal {
    class State<T> extends Signal<T> {
        private value;
        constructor(initial: T);
        get val(): T;
        set val(value: T);
    }
    namespace Compute {
        /**
         * A type representing a function that gets a value.
         * @template T - The type of the value to be retrieved.
         */
        type Getter<T> = {
            (): T;
        };
    }
    class Compute<T> extends Signal<T> {
        #private;
        private getter;
        constructor(getter: Compute.Getter<T>);
        protected start(self?: this): () => void;
        get val(): T;
    }
}
/**
 * Creates a new State signal with the provided initial value.
 * @template T - The type of the signal's value.
 * @param initial - The initial value of the signal.
 * @returns A new State signal.
 * @example
 * const count = ref(0);
 */
export declare let ref: <T>(initial: T) => Signal.State<T>;
/**
 * Creates a new Compute signal that computes its value using the provided callback function.
 * @template T - The type of the signal's value.
 * @param callback - The function to compute the signal's value.
 * @returns A new Compute signal.
 * @example
 * const doubleCount = computed(() => count.val * 2);
 */
export declare let computed: <T>(callback: Signal.Compute.Getter<T>) => Signal.Compute<T>;
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
export declare let effect: <T>(callback: Signal.Compute.Getter<T>) => Signal.Unfollower;
