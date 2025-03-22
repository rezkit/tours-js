/**
 * Annotation which will always return the given property as a `Date`
 */
export default function timestamp() {
  return function (target: any, propertyKey: string | symbol) {
    const internalKey = Symbol(propertyKey.toString());

    Object.defineProperty(target, propertyKey, {
      get() {
        return this[internalKey] ? new Date(this[internalKey]) : undefined;
      },
      set(value) {
        this[internalKey] = value ? new Date(value).toISOString() : undefined;
      },
      enumerable: true,
      configurable: true,
    });
    
    target.constructor.prototype[propertyKey] = undefined;
  };
}
