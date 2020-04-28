export function Deprecated<T extends { new(...args: any[]): {} }>(constructor: T) {
    console.warn(`${constructor.name} has been deprecated`);
    return constructor;
}