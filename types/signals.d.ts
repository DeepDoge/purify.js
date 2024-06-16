/**
 * @template T
 * @typedef Signal.State
 * @type {Signal<T> & { set: Signal.Setter<T>, val: T }}
 */
/**
 * @template T
 * @typedef Signal.Compute
 * @type {Signal<T>}
 */
/**
 * @template const T
 */
export class Signal<const T> {
    /**
     * @param {T} initial
     */
    constructor(initial: T);
    /**
     * @returns {T}
     */
    get(self?: this): T;
    get val(): T;
    /**
     * @param {Signal.Follower<T>} follower
     * @param {boolean} immediate
     * @returns {Signal.Unfollower}
     */
    follow(follower: Signal.Follower<T>, immediate?: boolean, self?: this): Signal.Unfollower;
    notify(self?: this, value?: T): void;
    #private;
}
export namespace Signal {
    type State<T_1> = Signal<T_1> & {
        set: Signal.Setter<T_1>;
        val: T_1;
    };
    let State: {
        new <T_2>(initial: T_2): {
            set: (value: T_2, self?: any) => void;
            /** @param {T} value */
            val: T_2;
            /** @type {T} */
            "__#2@#value": T_2;
            /** @type {Set<Signal.Follower<T>>} */
            "__#2@#followers": Set<Follower<T>>;
            /**
             * @param {T} value
             */
            "__#2@#set"(value: T_2, self?: any): void;
            /**
             * @returns {T}
             */
            get(self?: any): T_2;
            /**
             * @param {Signal.Follower<T>} follower
             * @param {boolean} immediate
             * @returns {Signal.Unfollower}
             */
            follow(follower: Follower<T_2>, immediate?: boolean, self?: any): Unfollower;
            notify(self?: any, value?: T_2): void;
        };
        State: any;
        Compute: {
            new <T_3>(callback: Compute.Callback<T_3>): {
                "__#1@#dirty": boolean;
                /** @type {Map<Signal<unknown>, Signal.Unfollower>} */
                "__#1@#dependencies": Map<Signal<unknown>, Unfollower>;
                /** @type {Signal.Compute.Callback<T>} */
                "__#1@#callback": Compute.Callback<T_3>;
                get(self?: any): T_3;
                "__#1@#update"(self?: any): void;
                /** @type {T} */
                "__#2@#value": T_3;
                /** @type {Set<Signal.Follower<T>>} */
                "__#2@#followers": Set<Follower<T>>;
                /**
                 * @param {T} value
                 */
                "__#2@#set"(value: T_3, self?: any): void;
                readonly val: T_3;
                /**
                 * @param {Signal.Follower<T>} follower
                 * @param {boolean} immediate
                 * @returns {Signal.Unfollower}
                 */
                follow(follower: Follower<T_3>, immediate?: boolean, self?: any): Unfollower;
                notify(self?: any, value?: T_3): void;
            };
            State: any;
            Compute: any;
        };
    };
    type Compute<T_4> = Signal<T_4>;
    let Compute: {
        new <T_5>(callback: Compute.Callback<T_5>): {
            "__#1@#dirty": boolean;
            /** @type {Map<Signal<unknown>, Signal.Unfollower>} */
            "__#1@#dependencies": Map<Signal<unknown>, Unfollower>;
            /** @type {Signal.Compute.Callback<T>} */
            "__#1@#callback": Compute.Callback<T_3>;
            get(self?: any): T_3;
            "__#1@#update"(self?: any): void;
            /** @type {T} */
            "__#2@#value": T_3;
            /** @type {Set<Signal.Follower<T>>} */
            "__#2@#followers": Set<Follower<T>>;
            /**
             * @param {T} value
             */
            "__#2@#set"(value: T_3, self?: any): void;
            readonly val: T_3;
            /**
             * @param {Signal.Follower<T>} follower
             * @param {boolean} immediate
             * @returns {Signal.Unfollower}
             */
            follow(follower: Follower<T_3>, immediate?: boolean, self?: any): Unfollower;
            notify(self?: any, value?: T_3): void;
        };
        State: {
            new <T_6>(initial: T_6): {
                set: (value: T_2, self?: any) => void;
                /** @param {T} value */
                val: T_2;
                /** @type {T} */
                "__#2@#value": T_2;
                /** @type {Set<Signal.Follower<T>>} */
                "__#2@#followers": Set<Follower<T>>;
                /**
                 * @param {T} value
                 */
                "__#2@#set"(value: T_2, self?: any): void;
                /**
                 * @returns {T}
                 */
                get(self?: any): T_2;
                /**
                 * @param {Signal.Follower<T>} follower
                 * @param {boolean} immediate
                 * @returns {Signal.Unfollower}
                 */
                follow(follower: Follower<T_2>, immediate?: boolean, self?: any): Unfollower;
                notify(self?: any, value?: T_2): void;
            };
            State: any;
            Compute: any;
        };
        Compute: any;
    };
    namespace Compute {
        /**
         * <T>
         */
        type Callback<T_7> = {
            (): T_7;
        };
    }
    /**
     * <T>
     */
    type Setter<T_8> = {
        (value: T_8): void;
    };
    /**
     * <T>
     */
    type Getter<T_9> = {
        (): T_9;
    };
    type Follower<T_10> = {
        (value: T_10): unknown;
    };
    type Unfollower = {
        (): void;
    };
}
export function ref<T>(value: T): {
    set: (value: T, self?: any) => void;
    /** @param {T} value */
    val: T;
    /** @type {T} */
    "__#2@#value": T;
    /** @type {Set<Signal.Follower<T>>} */
    "__#2@#followers": Set<Signal.Follower<T_1>>;
    /**
     * @param {T} value
     */
    "__#2@#set"(value: T, self?: any): void;
    /**
     * @returns {T}
     */
    get(self?: any): T;
    /**
     * @param {Signal.Follower<T>} follower
     * @param {boolean} immediate
     * @returns {Signal.Unfollower}
     */
    follow(follower: Signal.Follower<T>, immediate?: boolean, self?: any): Signal.Unfollower;
    notify(self?: any, value?: T): void;
};
export function computed<T>(callback: Signal.Compute.Callback<T>): {
    "__#1@#dirty": boolean;
    /** @type {Map<Signal<unknown>, Signal.Unfollower>} */
    "__#1@#dependencies": Map<Signal<unknown>, Signal.Unfollower>;
    /** @type {Signal.Compute.Callback<T>} */
    "__#1@#callback": Signal.Compute.Callback<T>;
    get(self?: any): T;
    "__#1@#update"(self?: any): void;
    /** @type {T} */
    "__#2@#value": T;
    /** @type {Set<Signal.Follower<T>>} */
    "__#2@#followers": Set<Signal.Follower<T_1>>;
    /**
     * @param {T} value
     */
    "__#2@#set"(value: T, self?: any): void;
    readonly val: T;
    /**
     * @param {Signal.Follower<T>} follower
     * @param {boolean} immediate
     * @returns {Signal.Unfollower}
     */
    follow(follower: Signal.Follower<T>, immediate?: boolean, self?: any): Signal.Unfollower;
    notify(self?: any, value?: T): void;
};
export function awaited<T, const U = null>(promise: Promise<T>, until?: U, signal?: Signal.State<T | U>): Signal<T | U>;
export function effect<T>(callback: Signal.Compute.Callback<T>): Signal.Unfollower;
