
export type FieldData = Record<string, FieldValue>

export type FieldValue = StringFieldValue | NumberFieldValue | BooleanFieldValue | SelectionFieldValue

export interface StringFieldValue {
    type: 'string' | 'rich_text' | 'url' | 'color' | 'date' | 'date_time'
    value: string
}

export interface NumberFieldValue {
    type: 'number'
    value: number
}

export interface BooleanFieldValue {
    type: 'boolean'
    value: boolean
}

export interface SelectionFieldValue {
    type: 'select'
    value: string[]
}
