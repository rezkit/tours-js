import type {
    Paginated,
    PaginatedQuery,
    QueryBoolean,
    SortableQuery,
    Entity,
    EntityType,
    ID
} from './common.js'
import type { AxiosInstance } from 'axios'
import {ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'
import type {CategorySortFields, ICategory, ListCategoriesQuery} from "./categories";
import {Category} from "./categories";
import type {CreateHolidayInput, HolidayListQuery, IHoliday, UpdateHolidayInput} from "./holidays";
import {Holiday} from "./holidays";


export interface IMap extends Entity {
    name: string
    published: boolean
    data: string
}

export interface CreateMapInput extends IMap {
    name: string
    published: boolean
    data: string
}

export type UpdateMapInput = Partial<CreateMapInput>

export interface ListMapsQuery extends PaginatedQuery {
    name?: string
    published?: QueryBoolean
    data?: string
}

export class Map implements IMap {
    private readonly axios: AxiosInstance

    @timestamp() readonly created_at!: Date
    @timestamp() readonly updated_at!: Date

    readonly id!: string
    readonly name!: string
    readonly published!: boolean
    readonly data!: string
    deleted_at!: null | string | Date

    constructor (data: IMap, axios: AxiosInstance) {
        this.axios = axios
        Object.assign(this, data)
    }

    async list (params?: ListMapsQuery): Promise<Paginated<Map>> {
        const response = (await this.axios.get<Paginated<IMap>>(`/${this.path}`, { params })).data

        response.data = response.data.map(c => new Map(c, this.axios))

        return response as Paginated<Map>
    }

    async create (params: CreateMapInput): Promise<Map> {
        const { data } = await this.axios.post<IMap>(this.path, params)
        return new Map(data, this.axios)
    }

    async update (params: UpdateMapInput): Promise<Map> {
        const { data } = await this.axios.patch<IMap>(this.path, params)

        Object.assign(this, data)

        return this
    }

    async find (id: string): Promise<Map> {
        const response = (await this.axios.get<IMap>(`/holidays/maps/${id}`)).data
        return new Map(response, this.axios)
    }

    async delete (): Promise<void> {
        await this.axios.delete(this.path)
        this.deleted_at = new Date()
    }

    get path () {
        return `/holidays/maps/${this.id}`
    }

}

export class Api extends ApiGroup {
    async list (params?: ListMapsQuery): Promise<Paginated<Map>> {
        const response = (await this.axios.get<Paginated<IMap>>('/holidays/maps', { params })).data

        response.data = response.data.map(h => new Map(h, this.axios))

        return response as Paginated<Map>
    }

    async find (id: string): Promise<Map> {
        const m = (await this.axios.get<IMap>(`/holidays/maps/${id}`)).data
        return new Map(m, this.axios)
    }

    async create (params: CreateMapInput): Promise<Map> {
        const m = (await this.axios.post<IMap>('/holidays/maps', params)).data
        return new Map(m, this.axios)
    }

    async update (id: string, params: UpdateMapInput): Promise<Holiday> {
        const m = (await this.axios.patch<IMap>(`/holidays/maps/${id}`, params)).data

        return new Holiday(m, this.axios)
    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(`/holidays/${id}`)
    }
}

export class MapAttachment<T extends ID> extends ApiGroup {
    readonly type: EntityType
    readonly entity: T

    constructor (axios: AxiosInstance, type: EntityType, entity: T) {
        super(axios)
        this.type = type
        this.entity = entity

    }

    async list (params?: ListMapsQuery): Promise<Paginated<Map>> {
        const response = (await this.axios.get<Paginated<IMap>>(`/${this.path}`, { params })).data

        response.data = response.data.map(c => new Map(c, this.axios))

        return response as Paginated<Map>
    }

    async update (id: string, params: UpdateMapInput): Promise<Map> {
        const { data } = await this.axios.patch<IMap>(`${this.path}/${id}`, params)
        return new Map(data, this.axios)

    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(`${this.path}/${id}`)
    }

    get path () {
        return `/holidays/maps`
    }

}