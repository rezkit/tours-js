import type {Entity, Paginated, PaginatedQuery} from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'

export interface IMapMarkers extends Entity {
    title: string
    file_path: string
}

export interface CreateMapMarkersInput {
    title: string
    image: File | Blob
}

export type UpdateMapMarkersInput = Partial<IMapMarkers>

export interface ListMapMarkersQuery extends PaginatedQuery {
    title?: string
}

export class MapMarkers implements IMapMarkers {
    private readonly axios: AxiosInstance

    @timestamp() readonly created_at!: Date;
    @timestamp() readonly updated_at!: Date;

    readonly id!: string;
    readonly title!: string
    file_path!: string
    deleted_at!: null | string | Date

    constructor (data: IMapMarkers, axios: AxiosInstance) {
        this.axios = axios
        Object.assign(this, data)
    }

    async list (params?: ListMapMarkersQuery): Promise<Paginated<MapMarkers>> {
        const response = (await this.axios.get<Paginated<IMapMarkers>>(`/maps/settings/markers/settings/markers`, { params })).data
        response.data = response.data.map(l => new MapMarkers(l, this.axios))
        return response as Paginated<MapMarkers>
    }

    async create (params: CreateMapMarkersInput): Promise<MapMarkers> {
        const { data } = await this.axios.post<IMapMarkers>('/maps/settings/markers/settings/markers', params)
        return new MapMarkers(data, this.axios)
    }

    async update (params: UpdateMapMarkersInput): Promise<MapMarkers> {
        const { data } = await this.axios.put<IMapMarkers>('/maps/settings/markers/settings/markers', params)
        Object.assign(this, data)

        return this
    }

    async find (id: string): Promise<MapMarkers> {
        const response = (await this.axios.get<IMapMarkers>(`/maps/settings/markers/settings/markers/${id}`)).data
        return new MapMarkers(response, this.axios)
    }

    async delete (): Promise<void> {
        await this.axios.delete('/maps/settings/markers/settings/markers')
        this.deleted_at = new Date()
    }

    async restore (): Promise<void> {
        await this.axios.restore('/maps/settings/markers')
        this.deleted_at = null
    }
}

export class Api extends ApiGroup {
    async list (params?: ListMapMarkersQuery): Promise<Paginated<MapMarkers>> {
        const response = (await this.axios.get<Paginated<IMapMarkers>>('/maps/settings/markers/settings/markers', { params })).data

        response.data = response.data.map(h => new MapMarkers(h, this.axios))

        return response as Paginated<MapMarkers>
    }

    async find (id: string): Promise<MapMarkers> {
        const m = (await this.axios.get<IMapMarkers>(`/maps/settings/markers/${id}`)).data
        return new MapMarkers(m, this.axios)
    }

    async create (params: CreateMapMarkersInput): Promise<MapMarkers> {
        const payload = new FormData()

        payload.set('title', params.title)
        payload.set('image', params.image)

        const m = (await this.axios.post<IMapMarkers>('/maps/settings/markers', payload)).data
        return new MapMarkers(m, this.axios)
    }

    async update (id: string, params: UpdateMapMarkersInput): Promise<MapMarkers> {
        const m = (await this.axios.patch<IMapMarkers>(`/maps/settings/markers/${id}`, params)).data

        return new MapMarkers(m, this.axios)
    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(`/maps/settings/markers/${id}`)
    }

    async restore (id: string): Promise<void> {
        await this.axios.restore(`/maps/settings/markers/${id}`)
    }
}
