import type { AxiosInstance } from 'axios'
import type { FieldData } from './fields.js'
import {
    ApiGroup,
    type Entity,
    type Fields,
    type Paginated,
    type PaginatedQuery,
    type QueryBoolean,
    type ReorderCommand
} from './common.js'
import timestamp from '../annotations/timestamp.js'
import {ContentAttachment, Contentized} from "./content";
import {Imagable, ImageAttachment} from "./images";

export interface IRoomType extends Entity, Fields {
    name: string
    accommodation_id: string
    introduction: string | null
    description: string | null
    published: boolean
    occupancy: { from: number, to: number }
    ordering: number
}

export interface CreateRoomTypeInput extends Partial<Fields> {
    name: string
    introduction?: string | null
    description?: string | null
    published: boolean
    occupancy: { from: number, to: number }
}

export type UpdateRoomTypeInput = Partial<CreateRoomTypeInput> & { ordering?: ReorderCommand }

export interface ListRoomTypesQuery extends PaginatedQuery {
    name?: string
    search?: string
    published?: QueryBoolean
    description?: string
}

export class RoomType implements IRoomType, Contentized<RoomType>, Imagable<RoomType> {
    readonly id!: string
    readonly accommodation_id!: string

    name!: string

    introduction!: string | null
    description!: string | null
    published!: boolean
    occupancy!: { from: number, to: number }
    ordering!: number

    fields!: FieldData

    @timestamp() readonly created_at!: Date
    @timestamp() readonly updated_at!: Date
    deleted_at!: null | string | Date

    private readonly axios: AxiosInstance

    constructor (values: IRoomType, axios: AxiosInstance) {
        this.axios = axios
        Object.assign(this, values)
    }

    async update (params: UpdateRoomTypeInput): Promise<RoomType> {
        const response = (await this.axios.patch<IRoomType>(this.path, params)).data
        Object.assign(this, response)
        return this
    }

    async destroy (): Promise<void> {
        await this.axios.delete(this.path)
        this.deleted_at = new Date()
    }

    async restore (): Promise<void> {
        await this.axios.put(this.path + '/restore')
        this.deleted_at = null
    }

    content (): ContentAttachment<this> {
        return new ContentAttachment<this>(this.axios, 'room_type', this)
    }

    images (): ImageAttachment<this> {
        return new ImageAttachment(this.axios, 'room_type', this)
    }

    async moveUp (): Promise<number> {
        const { data } = await this.axios.patch<IRoomType>(this.path, { ordering: 'up'} )
        this.ordering = data.ordering
        return data.ordering
    }

    async moveDown (): Promise<number> {
        const { data } = await this.axios.patch<IRoomType>(this.path, { ordering: 'down'} )
        this.ordering = data.ordering
        return data.ordering
    }

    get path (): string {
        return `/accommodations/${this.accommodation_id}/roomTypes/${this.id}`
    }

}

export class RoomTypes extends ApiGroup {
    readonly accommodationId: string
    constructor (axios: AxiosInstance, accommodationId: string) {
        super(axios)
        this.accommodationId = accommodationId
    }

    async list (params?: ListRoomTypesQuery): Promise<Paginated<RoomType>> {
        const resp = (await this.axios.get<Paginated<IRoomType>>(`/accommodations/${this.accommodationId}/roomTypes`, { params })).data

        resp.data = resp.data.map(r => new RoomType(r, this.axios))

        return resp as Paginated<RoomType>
    }

    async find (id: string): Promise<RoomType> {
        const resp = (await this.axios.get<IRoomType>(`/accommodations/${this.accommodationId}/roomTypes/${id}`)).data
        return new RoomType(resp, this.axios)
    }

    async create (params: CreateRoomTypeInput): Promise<RoomType> {
        const resp = (await this.axios.post<IRoomType>(`/accommodations/${this.accommodationId}/roomTypes`, params)).data
        return new RoomType(resp, this.axios)
    }

    async update (id: string, params: UpdateRoomTypeInput): Promise<RoomType> {
        const resp = (await this.axios.patch<IRoomType>(`/accommodations/${this.accommodationId}/roomTypes/${id}`, params)).data
        return new RoomType(resp, this.axios)
    }

    async destroy (id: string): Promise<void> {
        await this.axios.delete(`/accommodations/${this.accommodationId}/roomTypes/${id}`)
    }

    async restore (id: string): Promise<RoomType> {
        const resp = await this.axios.put<IRoomType>(`/accommodations/${this.accommodationId}/roomTypes/restore`)
        return new RoomType(resp.data, this.axios)
    }
}
