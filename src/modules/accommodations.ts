import type {
  Paginated,
  PaginatedQuery,
  QueryBoolean,
  Entity,
  Fields
} from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'

export interface IAccommodation extends Entity {
  name: string
  code: string

  introduction: string | null
  description: string | null
  published: boolean
  capacity: number
}

export interface CreateAccommodationInput extends Partial<Fields> {
  name: string
  code: string

  introduction?: string | null
  description?: string | null
  published?: boolean
  capacity?: number
}

export type UpdateAccommodationInput = Partial<CreateAccommodationInput>

export interface ListAccommodationsQuery extends PaginatedQuery {
  name?: string
  published?: QueryBoolean
  description?: string
}

export class Accommodation implements IAccommodation {
  readonly id!: string

  name!: string
  code!: string

  introduction!: string | null
  description!: string | null
  published!: boolean
  capacity!: number

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
}
