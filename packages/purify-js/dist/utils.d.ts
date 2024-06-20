export type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T_1>() => T_1 extends Y ? 1 : 2 ? A : B;
export type IsReadonly<T, K extends keyof T> = (<T_1>() => T_1 extends {
    [Q in K]: T[K];
} ? 1 : 2) extends <T_2>() => T_2 extends {
    readonly [Q_1 in K]: T[K];
} ? 1 : 2 ? true : false;
export type IsFunction<T> = T extends Fn ? true : false;
export type Fn = (...args: any[]) => any;
export type NotEventHandler<T, K extends keyof T> = NonNullable<T[K]> extends (this: any, event: infer U) => any ? U extends Event ? K extends `on${any}` ? false : true : true : true;
