import type {AxiosInstance} from "axios";
import type {CreateHolidayInput, HolidayListQuery, IHoliday, UpdateHolidayInput} from "./holidays.js";
import type {FieldData} from "./fields.js";
import {ApiGroup, type Paginated} from "./common.js";
import {Categories, type Categorized, CategoryAttachment} from "./categories.js";
import {Elements} from "./elements.js";
import timestamp from "../annotations/timestamp.js";
import {Departures} from "./departures.js";
import {Itinerary} from "./itinerary.js";

export interface IHolidayVersion extends IHoliday {
    holiday_id: string
}
export class HolidayVersion implements IHolidayVersion, Categorized<HolidayVersion> {

    private readonly axios: AxiosInstance

    constructor(values: IHolidayVersion, axios: AxiosInstance) {
        this.axios = axios
        Object.assign(this, values)
    }
    async update(params: UpdateHolidayInput): Promise<HolidayVersion> {
        const response = (await this.axios.patch<IHolidayVersion>(this.path, params)).data
        Object.assign(this, response)
        return this
    }
    async delete(): Promise<void> {
        await this.axios.delete(this.path)
        return
    }
    categories(): CategoryAttachment<HolidayVersion> {
        return new CategoryAttachment(this.axios, 'holiday_version', this)
    }
    get itinerary(): Itinerary {
        return new Itinerary(this.axios, this.id)
    }
    get departures(): Departures {
        return new Departures(this.axios, { version: this.id })
    }
    readonly code!: string;
    @timestamp() readonly created_at!: Date;
    @timestamp() readonly updated_at!: Date;
    readonly description!: string | null;
    readonly fields!: FieldData;
    readonly holiday_id!: string;
    readonly id!: string;
    readonly introduction!: string | null;
    readonly name!: string;
    readonly ordering!: number;
    readonly published!: boolean;
    get path(): string {
        return `/holidays/${this.holiday_id}/versions/${this.id}`
    }
    get elements(): Elements {
        return new Elements(this.axios, this.id)
    }
}
export class HolidayVersions extends ApiGroup {
    readonly holidayId: string
    constructor(axios: AxiosInstance, holidayId: string) {
        super(axios)
        this.holidayId = holidayId
    }
    /**
     * Get the versions for a `Holiday`
     *
     * @param params
     */
    async list(params?: HolidayListQuery): Promise<Paginated<HolidayVersion>> {
        const response = (await this.axios.get<Paginated<IHolidayVersion>>(`/holidays/${this.holidayId}/versions`, { params })).data
        response.data = response.data.map(v => new HolidayVersion(v, this.axios))
        return response as Paginated<HolidayVersion>
    }
    /**
     * Find a specific version
     * @param id
     */
    async find(id: string): Promise<HolidayVersion> {
        const response = (await this.axios.get<IHolidayVersion>(`/holidays/${this.holidayId}/versions/${id}`)).data
        return new HolidayVersion(response, this.axios)
    }
    /**
     * Create a new Version for this holiday
     * @param params
     */
    async create(params: CreateHolidayInput): Promise<HolidayVersion> {
        const response = (await this.axios.post<IHolidayVersion>(`/holidays/${this.holidayId}/versions`, params)).data
        return new HolidayVersion(response, this.axios)
    }
    /**
     * Restore a deleted Holiday Version
     * @param id
     */
    async restore(id: string): Promise<HolidayVersion> {
        const response = (await this.axios.put<HolidayVersion>(`/holidays/${this.holidayId}/versions/${id}/restore`)).data
        return new HolidayVersion(response, this.axios)
    }
    /**
     * Destroy a holiday version
     */
    async destroy(id: string): Promise<void> {
        await this.axios.delete(`/holidays/${this.holidayId}/versions/${id}`)
    }
    get categories(): Categories {
        return new Categories(this.axios, 'holiday_version')
    }
}
