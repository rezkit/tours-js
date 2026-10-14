/**
 * Decorator for auto-accessors which will always return the given property as a `Date`,
 * converting from the string representation returned by the API.
 *
 * @example
 * class Foo {
 *   @timestamp() accessor created_at!: Date
 * }
 */
export default function timestamp () {
  return function <This, V extends Date | undefined>(
    target: ClassAccessorDecoratorTarget<This, V>,
    _context: ClassAccessorDecoratorContext<This, V>
  ): ClassAccessorDecoratorResult<This, V> {
    return {
      get (this: This): V {
        const value: unknown = target.get.call(this)

        if (typeof value === 'string') {
          return new Date(value) as V
        }

        return value as V
      },

      set (this: This, value: V | string) {
        target.set.call(this, value as V)
      }
    }
  }
}
