import type {
  AttachmentResponse,
  Entity,
  EntityType,
  Fields,
  ID,
  Paginated,
  PaginatedQuery,
  QueryBoolean,
  SortableQuery
} from './common.js'
import { ApiGroup } from './common.js'
import type { AxiosInstance } from 'axios'
import type { TreeNode } from '../helpers.js'
import timestamp from '../annotations/timestamp.js'
import type { FieldData } from './fields.js'
import { Category, type ICategory } from './categories.js'
import { type Imagable, ImageAttachment } from './images.js'

export interface ILocation extends Entity, TreeNode, Fields {
  name: string
  parent_id: string | null

  published: boolean

  description: string | null

  children: ILocation[]
  category?: ICategory

  ordering: number
}

export class Location implements ILocation, Imagable<Location> {
  private readonly axios: AxiosInstance

  constructor (values: ILocation, axios: AxiosInstance) {
    Object.assign(this, values)
    this.axios = axios
    if (typeof (values?.category) === 'object') {
      this.category = new Category(values.category, axios)
    }

    if (values?.children.length > 0) {
      this.children = values.children.map(c => new Location(c, axios))
    } else {
      this.children = []
    }
  }

  async destroy (): Promise<void> {
    await this.axios.delete(this.path)
    this.deleted_at = new Date()
  }

  async update (params: UpdateLocationParams): Promise<Location> {
    const response = (await this.axios.patch<ILocation>(this.path, params)).data

    Object.assign(this, response)

    return new Location(response, this.axios)
  }

  async moveUp (): Promise<number> {
    const response = (await this.axios.patch<ILocation>(this.path, { ordering: 'up' })).data

    Object.assign(this, response)
    return response.ordering
  }

  async moveDown (): Promise<number> {
    const response = (await this.axios.patch<ILocation>(this.path, { ordering: 'down' })).data

    Object.assign(this, response)
    return response.ordering
  }

  @timestamp() readonly created_at!: Date
  readonly id!: string
  name!: string
  parent_id!: string | null
  @timestamp() readonly updated_at!: Date
  deleted_at?: Date
  description!: string | null
  published!: boolean
  readonly children!: Location[]
  category?: Category
  fields!: FieldData

  readonly ordering!: number

  get path (): string {
    return `locations/${this.id}`
  }

  images (): ImageAttachment<Location> {
    return new ImageAttachment<Location>(this.axios, 'location', this)
  }
}

export type LocationSortFields = 'name' | 'parent_id'

export interface ListLocationsQuery extends PaginatedQuery, SortableQuery<LocationSortFields> {
  name?: string
  search?: string
  published?: QueryBoolean

  /**
   * Include each locations children in the response
   */
  children?: QueryBoolean

  /**
   * Include each locations ancestors
   */
  ancestors?: QueryBoolean

  /**
   * Filter by parent ID
   */
  parent_id?: string | null
}

export interface CreateLocationParams extends Partial<Fields> {
  name: string
  category_id: string
  parent_id?: string
  description?: string
  published?: boolean
}

export interface UpdateLocationParams extends Partial<CreateLocationParams> {
  ordering?: 'up' | 'down'
}

export class Locations extends ApiGroup {
  async list (params?: ListLocationsQuery): Promise<Paginated<Location>> {
    const response = (await this.axios.get<Paginated<ILocation>>('/locations', { params })).data

    response.data = response.data.map((l: any) => new Location(l, this.axios))

    return response as Paginated<Location>
  }

  async create (params: CreateLocationParams): Promise<Location> {
    const { data } = await this.axios.post<ILocation>('/locations', params)
    return new Location(data, this.axios)
  }

  async find (id: string): Promise<Location> {
    const response = (await this.axios.get<ILocation>(`/locations/${id}`)).data
    return new Location(response, this.axios)
  }

  async destroy (id: string): Promise<void> {
    await this.axios.delete(`/locations/${id}`)
  }

  async restore (id: string): Promise<Location> {
    const { data } = await this.axios.put<ILocation>(`/locations/${id}/restore`)
    return new Location(data, this.axios)
  }

  attached (type: EntityType, id: string): LocationAttachment<ID> {
    return new LocationAttachment(this.axios, type, { id })
  }
}

export class LocationAttachment<T extends ID> extends ApiGroup {
  readonly type: EntityType
  readonly entity: T

  constructor (axios: AxiosInstance, type: EntityType, entity: T) {
    super(axios)
    this.type = type
    this.entity = entity
  }

  /**
   * List the attached locations
   * @param params
   */
  async list (params?: ListLocationsQuery): Promise<Paginated<Location>> {
    const response = (await this.axios.get<Paginated<ILocation>>(this.path, { params })).data

    response.data = response.data.map((l: any) => new Location(l, this.axios))

    return response as Paginated<Location>
  }

  /**
   * Attach additional locations. Preserving existing attachment.
   * @param ids
   */
  async attach (ids: string[]): Promise<AttachmentResponse> {
    const { data } = await this.axios.patch<AttachmentResponse>(this.path, { ids })
    return data
  }

  /**
   * Replace attached locations. Replaces all attached locations with the given locations
   * @param ids
   */
  async replace (ids: string[]): Promise<AttachmentResponse> {
    const { data } = await this.axios.put<AttachmentResponse>(this.path, { ids })
    return data
  }

  /**
   * Remove locations.
   * @param ids
   */
  async detach (ids: string[]): Promise<void> {
    await this.axios.delete<ILocation[]>(this.path, { params: { ids } })
  }

  /**
   * Get the path to the location resources
   */
  get path (): string {
    return `/${this.type}/${this.entity.id}/locations`
  }
}

export interface Locatable<T extends ID> {
  locations: () => LocationAttachment<T>
}
