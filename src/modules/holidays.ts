import {ApiGroup, Entity, Paginated, PaginatedQuery} from "./common";
import * as querystring from "querystring";
import {ParsedUrlQuery} from "querystring";
import {FieldData} from "./fields";
import {AxiosInstance} from "axios";

interface IHoliday extends Entity {
    name: string

    code: string

    introduction: string | null

    description: string | null

    published: boolean

    rank: number

    fields: FieldData
}

export interface CreateHolidayInput {
    name: string
    code: string

    introduction?: string | null
    description?: string | null

    rank?: number

    published?: boolean
}

export type UpdateHolidayInput = Partial<CreateHolidayInput>

export class Holiday implements IHoliday {
    private axios: AxiosInstance;

    constructor(values: IHoliday, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    async delete(): Promise<void> {
        await this.axios.delete(`/holidays/${this.id}`)
    }

    async update(params: UpdateHolidayInput): Promise<Holiday> {
        const rsp = (await this.axios.patch<IHoliday>(`/holidays/${this.id}`, params)).data
        Object.assign(this, rsp)
        return this
    }

    code!: string;
    readonly created_at!: string;
    description!: string | null;
    fields!: FieldData;
    readonly id!: string;
    introduction!: string | null;
    name!: string;
    published!: boolean;
    rank!: number;
    readonly updated_at!: string;
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
        const response = (await this.axios.get<Paginated<IHoliday>>(`/holidays${serializedQuery}`)).data

        response.data = response.data.map(h => new Holiday(h, this.axios))

        return response as Paginated<Holiday>
    }

    /**
     * Get a holiday
     * @param id Holiday
     */
    async find(id: string): Promise<Holiday> {
        const h = (await this.axios.get<IHoliday>(`/holidays/${id}`)).data
        return new Holiday(h, this.axios)
    }

    async create(params: CreateHolidayInput): Promise<Holiday> {
        const h = (await this.axios.post<IHoliday>(`/holidays`, params)).data
        return new Holiday(h, this.axios)
    }

    async update(id: string, params: UpdateHolidayInput): Promise<Holiday> {
        const h = (await this.axios.patch<IHoliday>(`/holidays/${id}`, params)).data

        return new Holiday(h, this.axios)
    }

    /**
     * Delete a holiday
     * @param id Holiday ID
     */
    async delete(id: string): Promise<void> {
        return (await this.axios.delete(`/holidays/${id}`))
    }
}
