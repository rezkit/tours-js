import type {
  Paginated,
  PaginatedQuery,
  QueryBoolean,
  Entity,
  EntityType,
  SortableQuery,
  ID
} from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'
import { type IMapLines, MapLines } from './mapLines.js'
import { type IMapMarkers, MapMarkers } from './mapMarkers.js'

export interface IMap extends Entity {
  title: string
  published: boolean
  data: string
}

export interface CreateMapInput {
  title: string
  published: boolean
  data: string
}

export type UpdateMapInput = Partial<CreateMapInput>

export type SortMap = 'title' | 'id' | 'created_at' | 'updated_at'

export interface ListMapsQuery extends PaginatedQuery, SortableQuery<SortMap> {
  title?: string
  published?: QueryBoolean
  data?: string
  search?: string
}

export class Map implements IMap {
  private readonly axios: AxiosInstance

  @timestamp() readonly created_at!: Date
  @timestamp() readonly updated_at!: Date

  readonly id!: string
  readonly title!: string
  readonly published!: boolean
  readonly data!: string
  deleted_at!: null | string | Date

  constructor (data: IMap, axios: AxiosInstance) {
    this.axios = axios
    Object.assign(this, data)
  }

  async update (params: UpdateMapInput): Promise<Map> {
    const { data } = await this.axios.patch<IMap>(this.path, params)

    Object.assign(this, data)

    return this
  }

  async delete (): Promise<void> {
    await this.axios.delete(this.path)
    this.deleted_at = new Date()
  }

  async restore (): Promise<void> {
    await this.axios.put(this.path + '/restore')
    this.deleted_at = null
  }

  get path (): string {
    return `/maps/${this.id}`
  }
}

export class Api extends ApiGroup {
  async list (params?: ListMapsQuery): Promise<Paginated<Map>> {
    const response = (await this.axios.get<Paginated<IMap>>('/maps', { params })).data

    response.data = response.data.map(h => new Map(h, this.axios))

    return response as Paginated<Map>
  }

  async find (id: string): Promise<Map> {
    const m = (await this.axios.get<IMap>(`/maps/${id}`)).data
    return new Map(m, this.axios)
  }

  async create (params: CreateMapInput): Promise<Map> {
    const m = (await this.axios.post<IMap>('/maps', params)).data
    return new Map(m, this.axios)
  }

  async update (id: string, params: UpdateMapInput): Promise<Map> {
    const m = (await this.axios.patch<IMap>(`/maps/${id}`, params)).data

    return new Map(m, this.axios)
  }

  async delete (id: string): Promise<void> {
    await this.axios.delete(`/maps/${id}`)
  }

  async restore (id: string): Promise<void> {
    await this.axios.put(`/maps/${id}/restore`)
  }

  async markers (): Promise<MapMarkers> {
    const response = (await this.axios.get<IMapMarkers>('/maps/settings/markers')).data
    return new MapMarkers(response, this.axios)
  }

  async lines (): Promise<MapLines> {
    const response = (await this.axios.get<IMapLines>('/maps/settings/lines')).data
    return new MapLines(response, this.axios)
  }
}

export class MapAttachment<T extends ID> extends ApiGroup {
  readonly type: EntityType
  readonly entity: T

  constructor (axios: AxiosInstance, type: EntityType, entity: T) {
    super(axios)
    this.type = type
    this.entity = entity
  }

  async list (params?: ListMapsQuery): Promise<Paginated<Map>> {
    const response = (await this.axios.get<Paginated<IMap>>(`/${this.path}`, { params })).data

    response.data = response.data.map(c => new Map(c, this.axios))

    return response as Paginated<Map>
  }

  async update (id: string, params: UpdateMapInput): Promise<Map> {
    const { data } = await this.axios.patch<IMap>(`${this.path}/${id}`, params)
    return new Map(data, this.axios)
  }

  async delete (id: string): Promise<void> {
    await this.axios.delete(`${this.path}/${id}`)
  }

  readonly path = '/maps'
}
