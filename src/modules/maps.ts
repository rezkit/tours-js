import type {
    Paginated,
    PaginatedQuery,
    QueryBoolean,
    Entity,
    EntityType,
    ID
} from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'
import { type IMapSettings, MapSettings } from "./mapSettings";


export interface IMap extends Entity {
    title: string
    published: boolean
    data: string
}

export interface CreateMapInput {
    title: string
    published: boolean
    data: string
}

export type UpdateMapInput = Partial<CreateMapInput>

export interface ListMapsQuery extends PaginatedQuery {
    title?: string
    published?: QueryBoolean
    data?: string
}

export class Map implements IMap {
    private readonly axios: AxiosInstance

    @timestamp() readonly created_at!: Date
    @timestamp() readonly updated_at!: Date

    readonly id!: string
    readonly title!: string
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
        const response = (await this.axios.get<IMap>(`/maps/${id}`)).data
        return new Map(response, this.axios)
    }

    async delete (): Promise<void> {
        await this.axios.delete(this.path)
        this.deleted_at = new Date()
    }

    async restore (): Promise<void> {
        await this.axios.restore(this.path)
        this.deleted_at = null
    }

    get path () {
        return `/maps/${this.id}`
    }

}

export class Api extends ApiGroup {
    async list (params?: ListMapsQuery): Promise<Paginated<Map>> {
        const response = (await this.axios.get<Paginated<IMap>>('/maps', { params })).data

        response.data = response.data.map(h => new Map(h, this.axios))

        return response as Paginated<Map>
    }

    async find (id: string): Promise<Map> {
        const m = (await this.axios.get<IMap>(`/maps/${id}`)).data
        return new Map(m, this.axios)
    }

    async create (params: CreateMapInput): Promise<Map> {
        const m = (await this.axios.post<IMap>('/maps', params)).data
        return new Map(m, this.axios)
    }

    async update (id: string, params: UpdateMapInput): Promise<Map> {
        const m = (await this.axios.patch<IMap>(`/maps/${id}`, params)).data

        return new Map(m, this.axios)
    }

    async options (): Promise<MapSettings> {
        const { data } = await this.axios.get<IMapSettings>(`maps/settings`)
        return new MapSettings(data, this.axios)
    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(`/maps/${id}`)
    }

    async restore (id: string): Promise<void> {
        await this.axios.restore(`/maps/${id}`)
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

    async restore (id: string): Promise<void> {
        await this.axios.restore(`${this.path}/${id}`)
    }

    get path () {
        return `/maps`
    }

}