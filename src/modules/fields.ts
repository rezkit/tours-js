import {ApiGroup} from "./common.js";

/**
 * User-defined field data
 *
 * Data for user-defined fields are stored as a mapping of field names to a value datum
 */
export type FieldData = { [name: string]: FieldValue }

/**
 * User-defined field value datum
 *
 */
export type FieldValue = StringFieldValue | NumberFieldValue | BooleanFieldValue | SelectionFieldValue

/**
 * Datum for a field containing string data
 */
export interface StringFieldValue {
    type: 'string' | 'rich_text' | 'url' | 'color' | 'date' | 'date_time'
    value: string
}

/**
 * Datum for a field containing numeric data
 */
export interface NumberFieldValue {
    type: 'number'
    value: number
}

/**
 * Datum for a field containing boolean data
 */
export interface BooleanFieldValue {
    type: 'boolean'
    value: boolean
}

/**
 * Datum for a field containing enum values
 */
export interface SelectionFieldValue {
    type: 'select'
    value: string[]
}

type EntityType = 'holiday' | 'holiday_version' | 'holiday_departure'

export class Api extends ApiGroup {

}
