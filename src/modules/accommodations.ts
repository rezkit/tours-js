import type {
  Paginated,
  PaginatedQuery,
  QueryBoolean,
  Entity,
  Fields,
  ReorderCommand, ID, EntityType, AttachmentResponse
} from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'
import { type Categorized, CategoryAttachment } from './categories.js'
import { ContentAttachment, type Contentized } from './content.js'
import { type Imagable, ImageAttachment } from './images.js'
import type { FieldData } from './fields.js'
import { RoomTypes } from './roomTypes.js'

export interface IAccommodation extends Entity, Fields {
  name: string
  introduction: string | null
  description: string | null
  published: boolean
  ordering: number
}

export interface CreateAccommodationInput extends Partial<Fields> {
  name: string
  introduction?: string | null
  description?: string | null
  published?: boolean
}

interface IAccommodationPivot {
  accommodatable_id: string
  accommodatable_type: string
  description: string | null
}

type attachmentUpdate = {
  id: string
  description?: string
}

export class AccommodationPivot implements IAccommodationPivot {
  readonly id!: string
  readonly accommodatable_id!: string
  readonly accommodatable_type!: string
  description!: string | null
  private readonly axios: AxiosInstance

  constructor (values: IAccommodationPivot, axios: AxiosInstance) {
    Object.assign(this, values)
    this.axios = axios
  }
}

export type UpdateAccommodationInput = Partial<CreateAccommodationInput> & { ordering?: ReorderCommand }

export interface ListAccommodationsQuery extends PaginatedQuery {
  name?: string
  search?: string
  published?: QueryBoolean
  description?: string
}

export class Accommodation implements IAccommodation, Categorized<Accommodation>, Contentized<Accommodation>, Imagable<Accommodation> {
  readonly id!: string

  name!: string

  introduction!: string | null
  description!: string | null
  published!: boolean
  ordering!: number

  fields!: FieldData

  @timestamp() readonly created_at!: Date
  @timestamp() readonly updated_at!: Date
  deleted_at!: null | string | Date

  private readonly axios: AxiosInstance

  /**
     * @internal
     * @param values
     * @param axios
     */
  constructor (values: IAccommodation, axios: AxiosInstance) {
    Object.assign(this, values)
    this.axios = axios
  }

  async update (params: UpdateAccommodationInput): Promise<Accommodation> {
    const response = (await this.axios.patch<IAccommodation>(this.path, params)).data
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

  roomTypes (): RoomTypes {
    return new RoomTypes(this.axios, this.id)
  }

  async moveUp (): Promise<number> {
    const { data } = await this.axios.patch<IAccommodation>(this.path, { ordering: 'up' })
    this.ordering = data.ordering
    return data.ordering
  }

  async moveDown (): Promise<number> {
    const { data } = await this.axios.patch<IAccommodation>(this.path, { ordering: 'down' })
    this.ordering = data.ordering
    return data.ordering
  }

  categories (): CategoryAttachment<this> {
    return new CategoryAttachment<this>(this.axios, 'accommodations', this)
  }

  content (): ContentAttachment<this> {
    return new ContentAttachment<this>(this.axios, 'accommodations', this)
  }

  images (): ImageAttachment<Accommodation> {
    return new ImageAttachment(this.axios, 'accommodations', this)
  }

  get path (): string {
    return `/accommodations/${this.id}`
  }
}

export class Api extends ApiGroup {
  async list (params?: ListAccommodationsQuery): Promise<Paginated<Accommodation>> {
    const response = (await this.axios.get<Paginated<IAccommodation>>('/accommodations', { params })).data

    response.data = response.data.map(a => new Accommodation(a, this.axios))

    return response as Paginated<Accommodation>
  }

  async find (id: string): Promise<Accommodation> {
    const a = (await this.axios.get<IAccommodation>(`/accommodations/${id}`)).data
    return new Accommodation(a, this.axios)
  }

  async create (params: CreateAccommodationInput): Promise<Accommodation> {
    const a = (await this.axios.post<IAccommodation>('/accommodations', params)).data
    return new Accommodation(a, this.axios)
  }

  async update (id: string, params: UpdateAccommodationInput): Promise<Accommodation> {
    const a = (await this.axios.patch<IAccommodation>(`/accommodations/${id}`, params)).data
    return new Accommodation(a, this.axios)
  }

  async destroy (id: string): Promise<void> {
    await this.axios.delete(`/accommodations/${id}`)
  }

  async restore (id: string): Promise<Accommodation> {
    const a = await this.axios.put<IAccommodation>(`/accommodations/${id}/restore`)
    return new Accommodation(a.data, this.axios)
  }

  roomTypes (accommodationId: string): RoomTypes {
    return new RoomTypes(this.axios, accommodationId)
  }
}

export class AccommodationsAttachment<T extends ID> extends ApiGroup {
  readonly type: EntityType
  readonly entity: T

  constructor (axios: AxiosInstance, type: EntityType, entity: T) {
    super(axios)
    this.type = type
    this.entity = entity
  }

  async list (params?: ListAccommodationsQuery): Promise<Paginated<Accommodation>> {
    const response = (await this.axios.get<Paginated<IAccommodation>>(this.path, { params })).data
    response.data = response.data.map(a => new Accommodation(a, this.axios))

    return response as Paginated<Accommodation>
  }

  async listAttachments (params?: ListAccommodationsQuery): Promise<Paginated<AccommodationPivot>> {
    const response = (await this.axios.get<Paginated<IAccommodationPivot>>(this.path + '/attachments', { params })).data
    response.data = response.data.map(a => new AccommodationPivot(a, this.axios))

    return response as Paginated<AccommodationPivot>
  }

  async attach (ids: string[]): Promise<AttachmentResponse> {
    const { data } = await this.axios.put<AttachmentResponse>(this.path, { ids })
    return data
  }

  async update (attachments: attachmentUpdate[]): Promise<AttachmentResponse> {
    const { data } = await this.axios.patch<AttachmentResponse>(this.path, { attachments })
    return data
  }

  async detach (ids: string[]): Promise<void> {
    await this.axios.delete(this.path, { params: { ids } })
  }

  get path (): string {
    return `/${this.type}/${this.entity.id}/accommodations`
  }
}

export interface Accommodatable<T extends ID> {
  accommodations: () => AccommodationsAttachment<T>
}
