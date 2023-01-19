import {ApiGroup} from "./common";

export type FieldData = { [name: string]: FieldValue }

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

type EntityType = 'holiday' | 'holiday_version' | 'holiday_departure'

export class Api extends ApiGroup {

}
