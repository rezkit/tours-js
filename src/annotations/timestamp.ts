/**
 * Annotation which will always return the given property as a `Date`
 */
export default function timestamp(): Function {
    return (target: any, name: PropertyKey) => {

        // Internal name of the property to actually store the value against
        const internalName = Symbol.for('__timestamp_' + String(name))

        Object.defineProperty(target, name, {
            get(this: any) {
                if (typeof this[internalName] === 'string') {
                    return new Date(this[internalName])
                }

                return this[internalName]
            },

            set(this: any, value: Date | string) {
                this[internalName] = value
            }
        });
    }
}
