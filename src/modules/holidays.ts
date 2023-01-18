import {ApiGroup, Entity, Paginated, PaginatedQuery} from "./common";
import * as querystring from "querystring";
import {ParsedUrlQuery} from "querystring";
import {FieldData} from "./fields";

export interface Holiday extends Entity {
    name: string

    code: string

    introduction: string | null

    description: string | null

    published: boolean

    rank: number

    fields: FieldData
}

export interface HolidayListQuery extends PaginatedQuery {

    /**
     * Filter holidays by name
     */
    name?: string

    /**
     * Filter holidays by code
     */
    code?: string

    /**
     * Free-text search query
     */
    search?: string
}

export class Api extends ApiGroup {


    /**
     * List Holidays
     *
     * @param query
     */
    async list(query?: HolidayListQuery): Promise<Paginated<Holiday>> {
        const serializedQuery = query !== undefined ? '?' + querystring.encode(query as ParsedUrlQuery) : ''
        return (await this.axios.get<Paginated<Holiday>>(`/holidays${serializedQuery}`)).data
    }

    /**
     * Get a holiday
     * @param id Holiday
     */
    async get(id: string): Promise<Holiday> {
        return (await this.axios.get<Holiday>(`/holidays/${id}`)).data
    }

    /**
     * Delete a holiday
     * @param id Holiday ID
     */
    async delete(id: string): Promise<void> {
        return (await this.axios.delete(`/holidays/${id}`))
    }
}
