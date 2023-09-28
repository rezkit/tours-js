import { Category, type ICategory } from './categories.js'
import type { AxiosInstance } from 'axios'
import type { Entity, Fields, Inventory, Paginated, PaginatedQuery, SortableQuery } from './common.js'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'
import type { FieldData } from './fields'

export interface IElement extends Entity, Fields {

  version_id: string
  is_package: boolean
  name: string

  published: boolean

  balance_due: null | number

  default_inventory: Inventory

  category: ICategory

  options: IElementOption[]
}

export type PriceUnit = 'unit' | 'person' | 'unit_day' | 'person_day'

export interface IElementOption extends Entity {
  category: ICategory
  published: boolean
  web_bookable: boolean
  is_lead: boolean
  name: string
  price_unit: PriceUnit
  constraints: Record<string, any>
  occupancy: { from: number, to: number }
}

export interface CreateElementParams extends Partial<Fields> {
  category_id: string
  name: string
  default_inventory: Inventory
}

export interface UpdateElementParams extends Partial<CreateElementParams> {
}

export class Element implements IElement {
  private readonly axios: AxiosInstance

  private apply (data: IElement): void {
    Object.assign(this, data)
    this.category = new Category(data.category, this.axios)
    this.options = data.options.map(o => new ElementOption(this.id, o, this.axios))
  }

  constructor (data: IElement, axios: AxiosInstance) {
    this.axios = axios
    this.apply(data)
  }

  async update (params: UpdateElementParams): Promise<Element> {
    const { data } = await this.axios.patch<IElement>(this.path, params)

    this.apply(data)

    return this
  }

  async delete (): Promise<void> {
    await this.axios.delete(this.path)
    this.deleted_at = new Date()
  }

  async createOption (params: CreateElementOption): Promise<ElementOption> {
    const { data } = await this.axios.post<IElementOption>(
          `/holidays/elements/${this.id}/options`, params)

    const option = new ElementOption(this.id, data, this.axios)
    this.options.push(option)
    return option
  }

  balance_due!: number | null
  category!: Category
  name!: string
  @timestamp() readonly created_at!: Date
  readonly id!: string
  default_inventory!: Inventory
  is_package!: boolean
  published!: boolean
  @timestamp() readonly updated_at!: Date
  version_id!: string
  fields!: FieldData

  deleted_at?: string | Date
  options!: ElementOption[]

  get path (): string {
    return `/holidays/versions/${this.version_id}/elements/${this.id}`
  }
}

export class ElementOption implements IElementOption {
  category!: Category
  constraints!: Record<string, any>
  @timestamp() readonly created_at!: Date
  readonly id!: string
  is_lead!: boolean
  name!: string
  occupancy!: { from: number, to: number }
  price_unit!: PriceUnit
  published!: boolean
  @timestamp() readonly updated_at!: Date
  web_bookable!: boolean

  private readonly axios: AxiosInstance

  @timestamp() deleted_at?: Date

  readonly element_id: string

  constructor (elementId: string, data: IElementOption, axios: AxiosInstance) {
    this.element_id = elementId
    Object.assign(this, data)

    this.axios = axios

    this.category = new Category(data.category, axios)
  }

  async update (params: UpdateElementOption): Promise<ElementOption> {
    const { data } = await this.axios.patch<IElementOption>(this.path, params)
    Object.assign(this, data)

    return this
  }

  async destroy (): Promise<void> {
    await this.axios.delete(this.path)
    this.deleted_at = new Date()
  }

  get path (): string {
    return `/holidays/elements/${this.element_id}/options/${this.id}`
  }
}

export interface CreateElementOption {
  name: string
  category_id: string
  published?: boolean
  web_bookable?: boolean
  is_lead?: boolean
  price_unit: PriceUnit
  occupancy: { from: number, to: number }

  constraints?: Record<string, any>
}

export type UpdateElementOption = Partial<CreateElementOption>

export type ElementSort = 'id' | 'name' | 'created_at' | 'updated_at'

export interface ListElementParams extends PaginatedQuery, SortableQuery<ElementSort> {
}

export class Elements extends ApiGroup {
  private readonly version_id: string

  constructor (axios: AxiosInstance, versionId: string) {
    super(axios)
    this.version_id = versionId
  }

  async list (params: ListElementParams): Promise<Paginated<Element>> {
    const { data } = await this.axios.get<Paginated<IElement>>(`/holidays/versions/${this.version_id}/elements`, { params })
    data.data = data.data.map(e => new Element(e, this.axios))

    return data as Paginated<Element>
  }

  async find (id: string): Promise<Element> {
    const { data } = await this.axios.get<IElement>(`/holidays/versions/${this.version_id}/elements/${id}`)
    return new Element(data, this.axios)
  }

  async create (params: CreateElementParams): Promise<Element> {
    const { data } = await this.axios.post<IElement>(`/holidays/versions/${this.version_id}/elements`, params)
    return new Element(data, this.axios)
  }

  async destroy (id: string): Promise<void> {
    await this.axios.delete(`/holidays/versions/${this.version_id}/elements/${id}`)
  }

  async update (id: string, params: UpdateElementParams): Promise<Element> {
    const { data } = await this.axios.patch<IElement>(`/holidays/versions/${this.version_id}/elements/${id}`, params)
    return new Element(data, this.axios)
  }
}
