import type { Entity, EntityType, ID } from './common.js'
import type { AxiosInstance } from 'axios'
import {ApiGroup} from './common.js'
import timestamp from '../annotations/timestamp.js'


export interface IMap extends Entity {
    type: EntityType
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

export class Map implements IMap {
    private readonly axios: AxiosInstance
    readonly type: EntityType

    @timestamp() readonly created_at!: Date
    @timestamp() readonly updated_at!: Date

    readonly id!: string
    readonly name!: string
    readonly published!: boolean
    readonly data!: string
    deleted_at!: null | string | Date

    constructor (axios: AxiosInstance, type: EntityType) {
        this.axios = axios
        this.type = type
    }

    async destroy (): Promise<void> {
        await this.axios.delete(this.path)
        this.deleted_at = new Date()
    }

    async update (params: UpdateMapInput): Promise<Map> {
        const { data } = await this.axios.patch<IMap>(this.path, params)

        Object.assign(this, data)

        return this
    }

    get path () {
        return `/holidays/maps/${this.id}`
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
    async create (params: CreateMapInput): Promise<Map> {
        const { data } = await this.axios.post<IMap>(`/holidays/maps/`, params)
        return new Map(data, this.axios)
    }

    async update (id: string, params: UpdateMapInput): Promise<IMap> {
        const { data } = await this.axios.patch<IMap>(`/holidays/maps/${id}`, params)
        return new Map(data, this.axios)

    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(`/holidays/maps/${id}`)
    }

}