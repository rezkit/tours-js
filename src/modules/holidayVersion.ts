import type { AxiosInstance } from 'axios'
import type { CreateHolidayInput, HolidayListQuery, IHoliday, UpdateHolidayInput } from './holidays.js'
import type { FieldData } from './fields.js'
import {ApiGroup, type Paginated, ReorderCommand} from './common.js'
import { Categories, type Categorized, CategoryAttachment } from './categories.js'
import { Elements } from './elements.js'
import timestamp from '../annotations/timestamp.js'
import { Departures } from './departures.js'
import { Itinerary } from './itinerary.js'
import type { Locatable } from './locations.js'
import { LocationAttachment } from './locations.js'
import { type IMap, Map } from './maps.js'
import { type Accommodatable, AccommodationsAttachment } from './accommodations.js'

export interface IHolidayVersion extends Omit<Omit<IHoliday, 'search_public'>, 'slug'> {
  holiday_id: string
  duration?: number
  map_id?: string
}

export interface UpdateHolidayVersionInput extends UpdateHolidayInput {
  duration?: number | null
  map_id?: string | null
}

export interface CreateHolidayVersionInput extends CreateHolidayInput {
  duration?: number | null
  map_id?: string | null
}

export class HolidayVersion implements IHolidayVersion, Categorized<HolidayVersion>, Locatable<HolidayVersion>, Accommodatable<HolidayVersion> {
  private readonly axios: AxiosInstance

  constructor (values: IHolidayVersion, axios: AxiosInstance) {
    this.axios = axios
    Object.assign(this, values)
  }

  async update (params: UpdateHolidayVersionInput): Promise<HolidayVersion> {
    const response = (await this.axios.patch<IHolidayVersion>(this.path, params)).data
    Object.assign(this, response)
    return this
  }
  
  async move (ordering: ReorderCommand): Promise<number> {
    const response = (await this.axios.patch<IHolidayVersion>(this.path, ordering)).data
    Object.assign(this, response)
    return this.ordering
  }

  async delete (): Promise<void> {
    await this.axios.delete(this.path)
  }

  categories (): CategoryAttachment<HolidayVersion> {
    return new CategoryAttachment(this.axios, 'holiday_version', this)
  }

  async map (): Promise<Map> {
    const response = (await this.axios.get<IMap>(`/maps/${this.map_id}`)).data
    return new Map(response, this.axios)
  }

  get itinerary (): Itinerary {
    return new Itinerary(this.axios, this.id)
  }

  get departures (): Departures {
    return new Departures(this.axios, { version: this.id })
  }

  readonly code!: string
  @timestamp() readonly created_at!: Date
  @timestamp() readonly updated_at!: Date
  readonly description!: string | null
  readonly fields!: FieldData
  readonly holiday_id!: string
  readonly id!: string
  readonly introduction!: string | null
  readonly name!: string
  readonly ordering!: number
  readonly published!: boolean
  duration?: number
  readonly map_id?: string

  get path (): string {
    return `/holidays/${this.holiday_id}/versions/${this.id}`
  }

  get elements (): Elements {
    return new Elements(this.axios, this.id)
  }

  locations (): LocationAttachment<this> {
    return new LocationAttachment<this>(this.axios, 'holiday_version', this)
  }

  accommodations (): AccommodationsAttachment<this> {
    return new AccommodationsAttachment<this>(this.axios, 'holiday_version', this)
  }
}
export class HolidayVersions extends ApiGroup {
  readonly holidayId: string
  constructor (axios: AxiosInstance, holidayId: string) {
    super(axios)
    this.holidayId = holidayId
  }

  /**
     * Get the versions for a `Holiday`
     *
     * @param params
     */
  async list (params?: HolidayListQuery): Promise<Paginated<HolidayVersion>> {
    const response = (await this.axios.get<Paginated<IHolidayVersion>>(`/holidays/${this.holidayId}/versions`, { params })).data
    response.data = response.data.map(v => new HolidayVersion(v, this.axios))
    return response as Paginated<HolidayVersion>
  }

  /**
     * Find a specific version
     * @param id
     */
  async find (id: string): Promise<HolidayVersion> {
    const response = (await this.axios.get<IHolidayVersion>(`/holidays/${this.holidayId}/versions/${id}`)).data
    return new HolidayVersion(response, this.axios)
  }

  /**
     * Create a new Version for this holiday
     * @param params
     */
  async create (params: CreateHolidayVersionInput): Promise<HolidayVersion> {
    const response = (await this.axios.post<IHolidayVersion>(`/holidays/${this.holidayId}/versions`, params)).data
    return new HolidayVersion(response, this.axios)
  }

  /**
     * Restore a deleted Holiday Version
     * @param id
     */
  async restore (id: string): Promise<HolidayVersion> {
    const response = (await this.axios.put<HolidayVersion>(`/holidays/${this.holidayId}/versions/${id}/restore`)).data
    return new HolidayVersion(response, this.axios)
  }

  /**
     * Destroy a holiday version
     */
  async destroy (id: string): Promise<void> {
    await this.axios.delete(`/holidays/${this.holidayId}/versions/${id}`)
  }

  get categories (): Categories {
    return new Categories(this.axios, 'holiday_version')
  }

  async map (id: string): Promise<Map> {
    const response = (await this.axios.get<IMap>(`/maps/${id}`)).data
    return new Map(response, this.axios)
  }
}
