/**
 * Annotation which will always return the given property as a `Date`
 */
export default function timestamp() {
  return (target: any, name: PropertyKey) => {
    console.log(target);
    
    if (typeof target === 'function' && target.prototype) {
    } else if (typeof target !== "object" || target === null) {
      throw new Error("Target must be an object");
    }

    const internalName = Symbol.for("__timestamp_" + String(name));

    Object.defineProperty(target, name, {
      get() {
        if (typeof this[internalName] === "string") {
          return new Date(this[internalName]);
        }
        return this[internalName];
      },
      set(value) {
        this[internalName] = value;
      }
    });
  };
}
