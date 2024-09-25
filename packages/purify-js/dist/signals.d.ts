export interface SignalLike<T> {
    readonly val: T;
    follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower;
}
export declare abstract class Signal<T> implements SignalLike<T> {
    abstract get val(): T;
    abstract follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower;
    derive<U>(getter: (value: T) => U): Signal.Computed<U>;
}
export declare namespace Signal {
    type Follower<T> = {
        (value: T): unknown;
    };
    type Unfollower = {
        (): void;
    };
    class State<T> extends Signal<T> {
        #private;
        constructor(initial: T);
        get val(): T;
        set val(newValue: T);
        follow(follower: Follower<T>, immediate?: boolean): Signal.Unfollower;
    }
    class Computed<T> extends Signal<T> {
        #private;
        constructor(dependencies: SignalLike<unknown>[], getter: () => T);
        get val(): T;
        follow(follower: Follower<T>, immediate?: boolean): Signal.Unfollower;
    }
}
export declare let ref: <T>(value: T) => Signal.State<T>;
export declare let computed: <T>(dependencies: SignalLike<unknown>[], getter: () => T) => Signal.Computed<T>;
export declare let awaited: <T, const U = null>(promise: Promise<T>, until?: U) => Signal<T | U>;
