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
import { ContentAttachment, type Contentized } from './content.js'
import { type Imagable, ImageAttachment } from './images.js'

export interface IRoomType extends Entity, Fields {
  name: string
  accommodation_id: string
  introduction: string | null
  description: string | null
  published: boolean
  occupancy: { from: number, to: number }
  ordering: number
  price: IAccommodationPrice
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
  readonly price: AccommodationPrice | undefined

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
    const { data } = await this.axios.patch<IRoomType>(this.path, { ordering: 'up' })
    this.ordering = data.ordering
    return data.ordering
  }

  async moveDown (): Promise<number> {
    const { data } = await this.axios.patch<IRoomType>(this.path, { ordering: 'down' })
    this.ordering = data.ordering
    return data.ordering
  }

  get path (): string {
    return `/accommodations/${this.accommodation_id}/roomTypes/${this.id}`
  }
}

export interface IAccommodationPrice extends Entity {
  readonly start: Date
  readonly end: Date
  readonly occupancy: { from: number, to: number }
  readonly currency:  string
  readonly value: number
  readonly published: boolean
}

export interface CreateAccommodationPriceParams {
  start: Date
  end: Date
  occupancy: { from: number, to: number }
  currency: string
  value: number
  published: boolean
}

export class AccommodationPrice implements IAccommodationPrice {
  readonly id!: string
  readonly roomType!: RoomType
  readonly currency!: string
  readonly start!: Date
  readonly end!: Date
  readonly occupancy!: { from: number; to: number }
  readonly published!: boolean
  readonly value!: number;
  @timestamp() readonly updated_at!: Date
  @timestamp() readonly created_at!: Date

  private readonly axios: AxiosInstance

  constructor(roomType: RoomType, data: IAccommodationPrice, axios: AxiosInstance) {
    this.roomType = roomType
    Object.assign(this, data)
    this.axios = axios
  }

  async update (params: UpdateAccommodationPriceParams): Promise<AccommodationPrice> {
    const { data } = await this.axios.patch<IAccommodationPrice>(`/accommodations/${this.roomType.accommodation_id}/roomTypes/prices/${this.id}`)
    Object.assign(this, data)
    return this
  }
}

export type UpdateAccommodationPriceParams = Partial<CreateAccommodationPriceParams>

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
