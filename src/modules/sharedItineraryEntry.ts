import type { Entity, Fields, Paginated, PaginatedQuery, SortableQuery } from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'

export interface ISharedItineraryEntry extends Entity {
    itinerary_id: string
    start_day: number
    end_day: number
    title: string
    description: string | null
    introduction: string | null
    includes_breakfast: boolean
    includes_lunch: boolean
    includes_dinner: boolean
    published: boolean
}

export interface CreateSharedItineraryEntry {
    start_day: number
    end_day: number
    title: string
    description: string | null
    introduction: string | null
    includes_breakfast: boolean
    includes_lunch: boolean
    includes_dinner: boolean
    published: boolean
}

export type UpdateSharedItineraryEntry = Partial<CreateSharedItineraryEntry>

export type SortSharedItineraryEntry = 'id' | 'itinerary_id' | 'start_day' | 'end_day' | 'title' | 'created_at' | 'updated_at'
export interface ListSharedItineraryEntryParams extends PaginatedQuery, SortableQuery<SortSharedItineraryEntry> {}


export class SharedItineraryEntry implements ISharedItineraryEntry {
    private readonly axios: AxiosInstance

    readonly id!: string
    itinerary_id!: string
    start_day!: number
    end_day!: number
    title!: string
    description!: string | null
    introduction!: string | null
    includes_breakfast!: boolean
    includes_lunch!: boolean
    includes_dinner!: boolean
    published!: boolean
    deleted_at!: null | string | Date
    @timestamp() readonly updated_at!: Date
    @timestamp() readonly created_at!: Date

    constructor(values: ISharedItineraryEntry, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    async update (params: UpdateSharedItineraryEntry): Promise<SharedItineraryEntry> {
        const { data } = await this.axios.patch<ISharedItineraryEntry>(this.path, params)
        Object.assign(this, data)

        return this
    }

    async delete (): Promise<void> {
        await this.axios.delete(this.path)
        this.deleted_at = new Date()
    }

    get path (): string {
        return `/itineraries/${this.itinerary_id}/entries/${this.id}`
    }
}

export class SharedItineraryEntries extends ApiGroup {
    readonly itinerary_id: string

    constructor (axios: AxiosInstance, itineraryId: string) {
        super(axios)
        this.itinerary_id = itineraryId
    }

    async list (params: ListSharedItineraryEntryParams): Promise<Paginated<SharedItineraryEntry>> {
        const { data } = await this.axios.get<Paginated<ISharedItineraryEntry>>(this.path, { params })

        data.data = data.data.map(s => new SharedItineraryEntry(s, this.axios))

        return data as Paginated<SharedItineraryEntry>
    }

    async find (id: string): Promise<SharedItineraryEntry> {
        const { data } = await this.axios.get<ISharedItineraryEntry>(`${this.path}/${id}`)
        return new SharedItineraryEntry(data, this.axios)
    }

    async create (params: CreateSharedItineraryEntry): Promise<SharedItineraryEntry> {
        const { data } = await this.axios.post<ISharedItineraryEntry>(this.path, params)
        return new SharedItineraryEntry(data, this.axios)
    }

    async update (id: string, params: UpdateSharedItineraryEntry): Promise<SharedItineraryEntry> {
        const { data } = await this.axios.patch<ISharedItineraryEntry>(`${this.path}/${id}`, params)
        return new SharedItineraryEntry(data, this.axios)
    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(`${this.path}/${id}`)
    }

    async restore (id: string): Promise<SharedItineraryEntry> {
        const { data } = await this.axios.put<ISharedItineraryEntry>(`${this.path}/${id}/restore`)
        return new SharedItineraryEntry(data, this.axios)
    }

    get path (): string {
        return `/itineraries/${this.itinerary_id}/entries`
    }
}