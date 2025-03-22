/**
 * Annotation which will always return the given property as a `Date`
 */
export default function timestamp() {
  return function (target: any, propertyKey: string | symbol): void {
    const internalKey = Symbol(propertyKey.toString());

    Object.defineProperty(target, propertyKey, {
      get() {
        return this[internalKey] ? new Date(this[internalKey]) : undefined;
      },
      set(value) {
        this[internalKey] = value instanceof Date ? value.toISOString() : value;
      },
      enumerable: true,
      configurable: true,
    });
  };
}

