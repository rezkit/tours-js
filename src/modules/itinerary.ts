import type { Entity, Fields, Paginated, PaginatedQuery, SortableQuery } from "./common.js";
import type {AxiosInstance} from "axios";
import {ApiGroup} from "./common.js";
import timestamp from "../annotations/timestamp.js";
import type { FieldData } from "./fields";

export interface IItineraryEntry extends Entity, Fields {

    version_id: string

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

export interface CreateItineraryEntry extends Partial<Fields> {
    start_day: number

    end_day: number

    title: string

    description?: string | null

    introduction?: string | null

    includes_breakfast?: boolean

    includes_lunch?: boolean

    includes_dinner?: boolean

    published?: boolean
}

export type UpdateItineraryEntry = Partial<CreateItineraryEntry>

export class ItineraryEntry implements IItineraryEntry {

    private axios: AxiosInstance

    @timestamp() readonly created_at!: Date;
    description!: string | null;
    end_day!: number;
    readonly id!: string;
    includes_breakfast!: boolean;
    includes_dinner!: boolean;
    includes_lunch!: boolean;
    introduction!: string | null;
    start_day!: number;
    title!: string;
    @timestamp() readonly updated_at!: Date;
    version_id!: string;
    published!: boolean;
    fields!: FieldData;
    deleted_at?: Date;

    constructor(values: IItineraryEntry, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    async update(params: UpdateItineraryEntry): Promise<ItineraryEntry> {
        const { data } = await this.axios.patch<IItineraryEntry>(this.path, params)
        Object.assign(this, data)

        return this
    }

    async destroy(): Promise<void> {
        await this.axios.delete(this.path)
        this.deleted_at = new Date()
    }

    get path(): string {
        return `/holidays/versions/${this.version_id}/itinerary/${this.id}`
    }

}

export type SortItineraryEntry = 'id' | 'start_day' | 'end_day' | 'title' | 'created_at' | 'updated_at'
export interface ListItineraryParams extends PaginatedQuery, SortableQuery<SortItineraryEntry> {

}

export class Itinerary extends ApiGroup {
    readonly version_id: string

    constructor(axios: AxiosInstance, version_id: string) {
        super(axios);
        this.version_id = version_id
    }

    async list(params: ListItineraryParams): Promise<Paginated<ItineraryEntry>> {
        const { data } = await this.axios.get<Paginated<IItineraryEntry>>(`/holidays/versions/${this.version_id}/itinerary`, { params })

        data.data = data.data.map(i => new ItineraryEntry(i, this.axios))

        return data as Paginated<ItineraryEntry>
    }

    async find(id: string): Promise<ItineraryEntry> {
        const { data } = await this.axios.get<IItineraryEntry>(`/holidays/versions/${this.version_id}/itinerary/${id}`)
        return new ItineraryEntry(data, this.axios)
    }

    async create(params: CreateItineraryEntry): Promise<ItineraryEntry> {
        const { data } = await this.axios.post<IItineraryEntry>(`/holidays/versions/${this.version_id}/itinerary`, params)
        return new ItineraryEntry(data, this.axios)
    }

    async update(id: string, params: UpdateItineraryEntry): Promise<ItineraryEntry> {
        const { data } = await this.axios.patch<ItineraryEntry>(`/holidays/versions/${this.version_id}/itinerary/${id}`, params)
        return new ItineraryEntry(data, this.axios)
    }

    async delete(id: string): Promise<void> {
        await this.axios.delete(`/holidays/versions/${this.version_id}/itinerary/${id}`)
    }

    async restore(id: string): Promise<ItineraryEntry> {
        const { data } = await this.axios.put<IItineraryEntry>(`/holidays/versions/${this.version_id}/itinerary/${id}/restore`)
        return new ItineraryEntry(data, this.axios)
    }
}
