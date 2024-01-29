import type {Entity, Paginated, PaginatedQuery} from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'

export interface IMapLines extends Entity {
    title: string
    hue: number
    thickness: number
}

export interface CreateMapLinesInput {
    title: string
    hue: number
    thickness: number
}

export type UpdateMapLinesInput = Partial<IMapLines>

export interface ListMapLinesQuery extends PaginatedQuery {
    title?: string
    hue?: number
    thickness?: number
}

export class MapLines implements IMapLines {
    private readonly axios: AxiosInstance

    @timestamp() readonly created_at!: Date;
    @timestamp() readonly updated_at!: Date;

    readonly id!: string;
    readonly title!: string
    readonly hue!: number
    readonly thickness!: number
    deleted_at!: null | string | Date

    constructor (data: IMapLines, axios: AxiosInstance) {
        this.axios = axios
        Object.assign(this, data)
    }

    async list (params?: ListMapLinesQuery): Promise<Paginated<MapLines>> {
        const response = (await this.axios.get<Paginated<IMapLines>>(`/maps/settings/lines`, { params })).data
        response.data = response.data.map(l => new MapLines(l, this.axios))
        return response as Paginated<MapLines>
    }

    async create (params: CreateMapLinesInput): Promise<MapLines> {
        const { data } = await this.axios.post<IMapLines>('/maps/settings/lines', params)
        return new MapLines(data, this.axios)
    }

    async update (params: UpdateMapLinesInput): Promise<MapLines> {
        const { data } = await this.axios.put<IMapLines>('/maps/settings/lines', params)
        Object.assign(this, data)

        return this
    }

    async find (id: string): Promise<MapLines> {
        const response = (await this.axios.get<IMapLines>(`/maps/settings/lines/${id}`)).data
        return new MapLines(response, this.axios)
    }

    async delete (): Promise<void> {
        await this.axios.delete('/maps/settings/lines')
        this.deleted_at = new Date()
    }

    async restore (): Promise<void> {
        await this.axios.restore('/maps/settings/lines')
        this.deleted_at = null
    }
}

export class Api extends ApiGroup {
    async list (params?: ListMapLinesQuery): Promise<Paginated<MapLines>> {
        const response = (await this.axios.get<Paginated<IMapLines>>('/maps/settings/lines', { params })).data

        response.data = response.data.map(h => new MapLines(h, this.axios))

        return response as Paginated<MapLines>
    }

    async find (id: string): Promise<MapLines> {
        const m = (await this.axios.get<IMapLines>(`/maps/settings/lines/${id}`)).data
        return new MapLines(m, this.axios)
    }

    async create (params: CreateMapLinesInput): Promise<MapLines> {
        const m = (await this.axios.post<IMapLines>('/maps/settings/lines', params)).data
        return new MapLines(m, this.axios)
    }

    async update (id: string, params: UpdateMapLinesInput): Promise<MapLines> {
        const m = (await this.axios.patch<IMapLines>(`/maps/settings/lines/${id}`, params)).data

        return new MapLines(m, this.axios)
    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(`/maps/settings/lines/${id}`)
    }

    async restore (id: string): Promise<void> {
        await this.axios.restore(`/maps/settings/lines/${id}`)
    }
}
