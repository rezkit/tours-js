import {
  ApiGroup,
  type FieldsQuery,
  type Entity,
  type Fields,
  type Paginated,
  type PaginatedQuery,
  type QueryBoolean,
  type ReorderCommand,
  type SortableQuery,
  type SEOProperties,
  type Slugged,
  type SEO
} from './common.js'
import type { FieldData } from './fields.js'
import type { AxiosInstance } from 'axios'
import { HolidayVersions } from './holidayVersion.js'
import { Categories, type Categorized, CategoryAttachment } from './categories.js'
import timestamp from '../annotations/timestamp.js'
import { Departures } from './departures.js'
import { Content, ContentAttachment, type Contentized } from './content.js'
import type { Imagable } from './images.js'
import { ImageAttachment } from './images.js'
import type { Locatable } from './locations.js'
import { LocationAttachment } from './locations.js'
import { type Accommodatable, AccommodationsAttachment } from './accommodations.js'

export * as Versions from './holidayVersion.js'

export interface IHoliday extends Entity, Fields, Slugged, SEO {
  name: string

  code: string

  introduction: string | null

  description: string | null

  published: boolean

  search_public: boolean | null

  ordering: number
}

export interface CreateHolidayInput extends Partial<Fields> {
  name: string
  code: string

  slug?: string | null
  introduction?: string | null
  description?: string | null
  published?: boolean | null
  search_public?: boolean
  seo?: Partial<SEOProperties>
}

export interface UpdateHolidayInput extends Partial<CreateHolidayInput> {
  ordering?: ReorderCommand
}

export interface SearchRequest {
  ccy?: string
  c0?: string[]
  c1?: string[]
  fh?: Record<string, string>
  fd?: Record<string, string>
  l?: Record<string, string[]>
  df?: string | Date
  dt?: string | Date
  pf?: number
  pt?: number
  pi?: number
  i?: number
  o?: number
  j?: 'a' | 'd'
  s?: string[]
}

interface CopyHolidayInput {
  name: string
  code: string
  copy_images: boolean
  copy_content_items: boolean
  version: object[]
}

export class Holiday implements IHoliday, Categorized<Holiday>, Contentized<Holiday>, Imagable<Holiday>, Locatable<Holiday>, Accommodatable<Holiday> {
  private readonly axios: AxiosInstance

  /**
     * @internal
     * @param values
     * @param axios
     */
  constructor (values: IHoliday, axios: AxiosInstance) {
    Object.assign(this, values)
    this.axios = axios
  }

  accommodations (): AccommodationsAttachment<Holiday> {
    return new AccommodationsAttachment(this.axios, 'holiday', this)
  }

  /**
     * Destroy this resource
     *
     * Destroys the resource and marks itself as deleted.
     *
     * @example
     * await holiday.destroy()
     */
  async destroy (): Promise<void> {
    await this.axios.delete(`/holidays/${this.id}`)
    this.deleted_at = new Date()
  }

  /**
     * Update the holiday with the given values.
     * Updates the current resource with the new values.
     *
     * @param params - New holiday properties
     * @returns Update holiday resource
     *
     * @example
     *  const holiday = client.holidays.find(id)
     *  await holiday.update({ name: 'New Name' })
     */
  async update (params: UpdateHolidayInput): Promise<Holiday> {
    const rsp = (await this.axios.patch<IHoliday>(`/holidays/${this.id}`, params)).data
    Object.assign(this, rsp)
    return this
  }

  async move (ordering: ReorderCommand): Promise<number> {
    const { data } = await this.axios.patch<IHoliday>(`/holidays/${this.id}`, { ordering })
    this.ordering = data.ordering
    return data.ordering
  }

  /**
     * Get an API client for this holiday's versions
     */
  get versions (): HolidayVersions {
    return new HolidayVersions(this.axios, this.id)
  }

  /**
     * Get an API client for this holiday's departures
     */
  get departures (): Departures {
    return new Departures(this.axios, { holiday: this.id })
  }

  /**
     * Get an API client for this holiday's categories
     */
  categories (): CategoryAttachment<this> {
    return new CategoryAttachment<this>(this.axios, 'holiday', this)
  }

  content (): ContentAttachment<this> {
    return new ContentAttachment<this>(this.axios, 'holiday', this)
  }

  locations (): LocationAttachment<this> {
    return new LocationAttachment<this>(this.axios, 'holiday', this)
  }

  code!: string
  @timestamp() readonly created_at!: Date
  @timestamp() readonly updated_at!: Date
  description!: string | null
  fields!: FieldData
  readonly id!: string
  introduction!: string | null
  name!: string
  published!: boolean
  search_public!: boolean | null
  ordering!: number
  deleted_at!: null | string | Date
  slug!: string
  seo!: SEOProperties

  images (): ImageAttachment<Holiday> {
    return new ImageAttachment(this.axios, 'holiday', this)
  }
}

export type HolidaySortFields = 'id' | 'name' | 'code' | 'ordering' | 'created_at' | 'updated_at'

export interface HolidayListQuery extends PaginatedQuery, SortableQuery<HolidaySortFields>, FieldsQuery {

  /**
     * Filter holidays by name
     */
  name?: string

  /**
     * Filter holidays by code
     */
  code?: string

  /**
     * Free-text search query
     */
  search?: string

  /**
     * Filter by publishing status
     */
  published?: QueryBoolean
}

export class Api extends ApiGroup {
  /**
     * Filter, sort, paginate and list Holidays
     *
     * @param params - List query parameters
     * @returns Paginated holiday list
     *
     * @example
     * const client = new TourManager({ api_key })
     * const { data } = await client.holidays.list({ sort: 'code', page: 1, limit: 50 })
     * data.forEach(h => console.log(h.code + "\t" + h.name))
     */
  async list (params?: HolidayListQuery): Promise<Paginated<Holiday>> {
    const response = (await this.axios.get<Paginated<IHoliday>>('/holidays', { params })).data

    response.data = response.data.map(h => new Holiday(h, this.axios))

    return response as Paginated<Holiday>
  }

  /**
     * Get a single holiday by ID
     *
     * @param id - Holiday ID
     *
     * @returns Holiday resource
     *
     * @example
     * const client = new TourManager({ api_key })
     * const holiday = await client.holidays.find(id)
     */
  async find (id: string): Promise<Holiday> {
    const h = (await this.axios.get<IHoliday>(`/holidays/${id}`)).data
    return new Holiday(h, this.axios)
  }

  /**
     * Create a new holiday with the given properties
     * @param params Holiday properties
     *
     * @example
     * const c = new TourManager({ api_key })
     * const holiday: Holiday = await c.holidays.create({ name: 'x', code: 'TEST' })
     */
  async create (params: CreateHolidayInput): Promise<Holiday> {
    const h = (await this.axios.post<IHoliday>('/holidays', params)).data
    return new Holiday(h, this.axios)
  }

  async update (id: string, params: UpdateHolidayInput): Promise<Holiday> {
    const h = (await this.axios.patch<IHoliday>(`/holidays/${id}`, params)).data

    return new Holiday(h, this.axios)
  }

  async copy (id: string, params: CopyHolidayInput): Promise<Holiday> {
    const h = (await this.axios.put<IHoliday>(`/holidays/${id}/copy`, params)).data
    return new Holiday(h, this.axios)
  }

  /**
     * Delete a holiday
     * @param id Holiday ID
     */
  async delete (id: string): Promise<void> {
    await this.axios.delete(`/holidays/${id}`)
  }

  /**
     * Restore a deleted holiday
     *
     * @param id
     */
  async restore (id: string): Promise<Holiday> {
    const { data } = await this.axios.put(`/holidays/${id}/restore`)
    return new Holiday(data, this.axios)
  }

  /**
     * Get a versions API client for a given Holiday ID
     */
  versions (holidayId: string): HolidayVersions {
    return new HolidayVersions(this.axios, holidayId)
  }

  /**
     * Get a departures API client for all departures
     */
  get departures (): Departures {
    return new Departures(this.axios)
  }

  /**
     * Get a holiday categories API client
     */
  get categories (): Categories {
    return new Categories(this.axios, 'holiday')
  }

  get content (): Content {
    return new Content(this.axios, 'holiday')
  }

  async search (params: SearchRequest): Promise<Record<string, unknown>> {
    const { data } = await this.axios.get('/holiday/search', { params })
    return data
  }
}
