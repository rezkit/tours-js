import type { Entity, Paginated, PaginatedQuery, QueryBoolean, SortableQuery } from './common.js'
import { ApiGroup } from './common.js'
import type { AxiosInstance } from 'axios'
import timestamp from '../annotations/timestamp.js'
import { SharedItineraryEntries } from './sharedItineraryEntry.js'

export interface ISharedItinerary extends Entity {
    shared_id: string
    duration: number
    title: string
    published: boolean
}

export interface CreateSharedItinerary {
    duration: number
    title: string
    published: boolean
}

export type UpdateSharedItinerary = Partial<CreateSharedItinerary>

export type SortSharedItinerary = 'id' | 'duration' | 'title' | 'created_at' | 'updated_at'

export interface ListSharedItineraryParams extends PaginatedQuery, SortableQuery<SortSharedItinerary> {
    title?: string
    published?: QueryBoolean
    search?: string
}

export class SharedItinerary implements ISharedItinerary {
    private readonly axios: AxiosInstance

    readonly id!: string
    shared_id!: string
    duration!: number
    title!: string
    published!: boolean
    deleted_at!: null | string | Date

    @timestamp() readonly updated_at!: Date
    @timestamp() readonly created_at!: Date

    constructor (values: ISharedItinerary, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    async update (params: UpdateSharedItinerary): Promise<SharedItinerary> {
        const { data } = await this.axios.patch<ISharedItinerary>(this.path, params)
        Object.assign(this, data)

        return this
    }

    async delete (orphan: boolean = false): Promise<void> {
        await this.axios.delete(this.path, { params: { orphan } })
        this.deleted_at = new Date()
    }

    async restore (): Promise<void> {
        await this.axios.put(this.path + '/restore')
        this.deleted_at = null
    }

    get path (): string {
        return `/itineraries/${this.id}`
    }
}

export class Api extends ApiGroup {
    async list (params?: ListSharedItineraryParams): Promise<Paginated<SharedItinerary>> {
        const { data } = await this.axios.get<Paginated<ISharedItinerary>>('/itineraries', { params })

        data.data = data.data.map(i => new SharedItinerary(i, this.axios))

        return data as Paginated<SharedItinerary>
    }

    async find (id: string): Promise<SharedItinerary> {
        const { data } = await this.axios.get<ISharedItinerary>(`/itineraries/${id}`)
        return new SharedItinerary(data, this.axios)
    }

    async create (params: CreateSharedItinerary): Promise<SharedItinerary> {
        const { data } = await this.axios.post<ISharedItinerary>('/itineraries', params)
        return new SharedItinerary(data, this.axios)
    }

    async update (id: string, params: UpdateSharedItinerary): Promise<SharedItinerary> {
        const { data } = await this.axios.patch<ISharedItinerary>(`/itineraries/${id}`, params)
        return new SharedItinerary(data, this.axios)
    }

    async delete (id: string, orphan: boolean = false): Promise<void> {
        await this.axios.delete(`/itineraries/${id}`, { params: { orphan } })
    }

    async restore (id: string): Promise<void> {
        await this.axios.put(`/itineraries/${id}/restore`)
    }

    entries (itineraryId: string): SharedItineraryEntries {
        return new SharedItineraryEntries(this.axios, itineraryId)
    }
}