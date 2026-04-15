import type { AxiosInstance } from 'axios'
import {
  type Entity,
  type Paginated,
  type PaginatedQuery,
  type ReorderCommand,
  type SortableQuery,
  ApiGroup
} from './common.js'
import { type Categorized, CategoryAttachment } from './categories.js'
import timestamp from '../annotations/timestamp.js'

export interface RelatedHoliday {
  name: string
  code: string
}

export interface IHolidayEdge extends Entity {
  source_id: string
  destination_id: string
  holiday: RelatedHoliday
  category_id: string
  start_day?: number
  ordering?: number
  published: boolean
}

export interface CreateHolidayEdgeParams {
  destination_id: string
  category_id: string
  start_day?: number
  published?: boolean
}

export interface UpdateHolidayEdgeParams extends Partial<CreateHolidayEdgeParams> {
  ordering?: ReorderCommand
  category_id?: string
  start_day?: number
  published?: boolean
}

export class HolidayEdge implements
    IHolidayEdge,
    Categorized<HolidayEdge> {
  constructor (data: IHolidayEdge, axios: AxiosInstance) {
    Object.assign(this, data)
    this.category = new Category(data.category, axios)
    this.axios = axios
  }

  private readonly axios: AxiosInstance
  readonly id!: string
  source_id!: string
  destination_id!: string
  holiday!: RelatedHoliday
  category_id!: string
  start_day!: number | null
  ordering?: number
  published!: boolean
  @timestamp() readonly created_at!: Date
  @timestamp() readonly updated_at!: Date

  async update (params: UpdateHolidayEdgeParams): Promise<HolidayEdge> {
    const { data } = await this.axios.patch<IHolidayEdge>(this.path, params)
    Object.assign(this, data)
    return this
  }

  async move (ordering: ReorderCommand): Promise<number> {
    const { data } = (await this.axios.patch<IHolidayEdge>(this.path, { ordering }))
    Object.assign(this, data)
    return this.ordering
  }

  async delete (): Promise<void> {
    await this.axios.delete(this.path)
  }

  categories (): CategoryAttachment<HolidayEdge> {
    return new CategoryAttachment(this.axios, 'holiday_edge', this)
  }

  get path (): string {
    return `/holidays/${this.source_id}/versions/${this.id}`
  }
}

export type HolidayEdgeSortFields = 'id' | 'ordering' | 'created_at' | 'updated_at'

export interface HolidayEdgeListQuery extends PaginatedQuery, SortableQuery<HolidayEdgeSortFields> {
  published?: QueryBoolean
}

export class HolidayEdges extends ApiGroup {
  readonly holidayId: string
  constructor (axios: AxiosInstance, holidayId: string) {
    super(axios)
    this.holidayId = holidayId
  }

  async list (params?: HolidayEdgeListQuery): Promise<Paginated<HolidayEdge>> {
    const { data } = await this.axios.get<Paginated<IHolidayEdge>>(`/holidays/${this.holidayId}/relations`, { params })
    data.data = data.data.map(he => new HolidayEdge(he, this.axios))
    return data as Paginated<HolidayEdge>
  }

  async find (id: string): Promise<HolidayEdge> {
    const { data } = await this.axios.get<IHolidayEdge>(`/holidays/${this.holidayId}/relations/${id}`)
    return new HolidayEdge(data, this.axios)
  }

  async create (params: CreateHolidayEdgeParams): Promise<HolidayEdge> {
    const { data } = await this.axios.post<IHolidayEdge>(`/holidays/${this.holidayId}/relations`, { params })
    return new HolidayEdge(data, this.axios)
  }

  async delete (id: string): Promise<void> {
    await this.axios.delete(`/holidays/${this.holidayId}/relations/${id}`)
  }

  async restore (id: string): Promise<void> {
    const { data } = await this.axios.put<IHolidayEdge>(`/holidays/${this.holidayId}/relations/${id}/restore`)
    return new HolidayEdge(data, this.axios)
  }
}
