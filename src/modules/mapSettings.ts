import type { Entity } from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'

export interface IMapSettings extends Entity {
    lines: {
        name: string,
        hue: number,
        thickness: number
    }[] | null
    markers: {
        name: string
        file_path: string
        file_size: string
    }[] | null
}

export interface MapSettings {
    lines: {
        name: string,
        hue: number,
        thickness: number
    }[] | null
    markers: {
        name: string
        file_path: string
        file_size: string
    }[] | null
}

export type UpdateMapSettings = Partial<MapSettings>

export class MapSettings implements IMapSettings {
    private readonly axios: AxiosInstance

    @timestamp() readonly created_at!: Date;
    @timestamp() readonly updated_at!: Date;
    deleted_at!: null | string | Date

    readonly id!: string;
    lines!: { name: string; hue: number; thickness: number }[] | null;
    markers!: { name: string; file_path: string; file_size: string }[] | null;

    constructor (data: IMapSettings, axios: AxiosInstance) {
        this.axios = axios
        Object.assign(this, data)
    }

    async create (params: Partial<MapSettings>): Promise<MapSettings> {
        const { data } = await this.axios.post<IMapSettings>(`/maps/settings`, params)
        return new MapSettings(data, this.axios)
    }

    async get (): Promise<MapSettings> {
        const response = (await this.axios.get<IMapSettings>(`/maps/settings`)).data
        return new MapSettings(response, this.axios)
    }

    async update (params: UpdateMapSettings): Promise<MapSettings> {
        const { data } = await this.axios.put<IMapSettings>('/maps/settings', params)
        Object.assign(this, data)

        return this
    }

    async delete (): Promise<void> {
        await this.axios.delete('/maps/settings')
        this.deleted_at = new Date()
    }

    async restore (): Promise<void> {
        await this.axios.restore('/maps/settings')
        this.deleted_at = null
    }
}

export class Api extends ApiGroup {
    async get (): Promise<MapSettings> {
        const response = (await this.axios.get<IMapSettings>(`/maps/settings`)).data
        return new MapSettings(response, this.axios)
    }

    async create (params: Partial<MapSettings>): Promise<MapSettings> {
        const { data } = await this.axios.post<IMapSettings>(`/maps/settings`, params)
        return new MapSettings(data, this.axios)
    }

    async update (params: UpdateMapSettings): Promise<MapSettings> {
        const { data } = await this.axios.put<IMapSettings>('/maps/settings', params)
        return new MapSettings(data, this.axios)
    }

    async delete (): Promise<void> {
        await this.axios.delete(`/maps/settings`)
    }

    async restore (): Promise<void> {
        await this.axios.restore(`/maps/settings`)
    }
}