import type {
  Entity,
  EntityType,
  Paginated,
  PaginatedQuery,
  QueryBoolean,
  SortableQuery,
  ID,
  Fields,
  AttachmentResponse,
  Slugged,
  SEO,
  SEOProperties, ReorderCommand
} from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import type { TreeNode } from '../helpers.js'
import timestamp from '../annotations/timestamp.js'
import type { FieldData } from './fields.js'

export interface ICategory extends Entity, TreeNode, Fields, Slugged, SEO {
  type: EntityType
  name: string
  parent_id: string | null

  published: boolean

  searchable: boolean

  description: string | null

  children: ICategory[]

  ordering: number
}

export class Category implements ICategory {
  private readonly axios: AxiosInstance
  constructor (values: ICategory, axios: AxiosInstance) {
    Object.assign(this, values)
    this.axios = axios

    if (values.children?.length > 0) {
      this.children = values.children.map(c => new Category(c, axios))
    } else {
      this.children = []
    }
  }

  async destroy (): Promise<void> {
    await this.axios.delete(this.apiPath)
    this.deleted_at = new Date()
  }

  async update (params: UpdateCategoryParams): Promise<Category> {
    const response = (await this.axios.patch<ICategory>(this.apiPath, params)).data

    Object.assign(this, response)

    return new Category(response, this.axios)
  }

  async move (ordering: ReorderCommand): Promise<number> {
    const response = (await this.axios.patch<ICategory>(this.apiPath, { ordering })).data

    Object.assign(this, response)
    return response.ordering
  }

  @timestamp() readonly created_at!: Date
  readonly id!: string
  name!: string
  parent_id!: string | null
  type!: EntityType
  @timestamp() readonly updated_at!: Date
  deleted_at?: Date
  description!: string | null
  published!: boolean
  searchable!: boolean
  readonly children!: Category[]
  fields!: FieldData
  slug!: string
  seo!: SEOProperties

  readonly ordering!: number

  get apiPath (): string {
    return `${this.type}/categories/${this.id}`
  }
}

export type CategorySortFields = 'name' | 'parent_id'
export interface ListCategoriesQuery extends PaginatedQuery, SortableQuery<CategorySortFields> {
  name?: string
  search?: string
  published?: QueryBoolean
  searchable?: QueryBoolean

  /**
     * Include each category's children in the response
     */
  children?: QueryBoolean

  /**
     * Include each category's ancestors
     */
  ancestors?: QueryBoolean

  /**
     * Filter by parent ID
     */
  parent_id?: string | null
}
export interface CreateCategoryParams extends Partial<Fields> {
  name: string
  slug?: string
  parent_id?: string
  description?: string
  published?: boolean
  searchable?: boolean
  seo?: Partial<SEOProperties>
}

export interface UpdateCategoryParams extends Partial<CreateCategoryParams> {
  ordering?: 'up' | 'down'
}

export class Categories extends ApiGroup {
  readonly type: EntityType

  constructor (axios: AxiosInstance, type: EntityType) {
    super(axios)
    this.type = type
  }

  async list (params?: ListCategoriesQuery): Promise<Paginated<Category>> {
    const response = (await this.axios.get<Paginated<ICategory>>(`/${this.type}/categories`, { params })).data

    response.data = response.data.map(c => new Category(c, this.axios))

    return response as Paginated<Category>
  }

  async create (params: CreateCategoryParams): Promise<Category> {
    const response = (await this.axios.post<ICategory>(`/${this.type}/categories`, params)).data
    return new Category(response, this.axios)
  }

  async find (id: string): Promise<Category> {
    const response = (await this.axios.get<ICategory>(`/${this.type}/categories/${id}`)).data
    return new Category(response, this.axios)
  }

  async destroy (id: string): Promise<void> {
    await this.axios.delete(`/${this.type}/categories/${id}`)
  }

  async restore (id: string): Promise<Category> {
    const { data } = await this.axios.put<ICategory>(`/${this.type}/categories/${id}/restore`)
    return new Category(data, this.axios)
  }

  attached (id: string): CategoryAttachment<ID> {
    return new CategoryAttachment(this.axios, this.type, { id })
  }
}

export class CategoryAttachment<T extends ID> extends ApiGroup {
  readonly type: EntityType
  readonly entity: T

  constructor (axios: AxiosInstance, type: EntityType, entity: T) {
    super(axios)
    this.type = type
    this.entity = entity
  }

  /**
     * List the attached categories
     * @param params
     */
  async list (params?: ListCategoriesQuery): Promise<Paginated<Category>> {
    const response = (await this.axios.get<Paginated<ICategory>>(this.apiPath, { params })).data

    response.data = response.data.map(c => new Category(c, this.axios))

    return response as Paginated<Category>
  }

  /**
     * Attach additional categories. Preserving existing attachment.
     * @param ids
     */
  async attach (ids: string[]): Promise<AttachmentResponse> {
    return (await this.axios.patch<AttachmentResponse>(this.apiPath, { ids })).data
  }

  /**
     * Replace attached categories. Replaces all attached categories with the given categories
     * @param ids
     */
  async replace (ids: string[]): Promise<AttachmentResponse> {
    return (await this.axios.put<AttachmentResponse>(this.apiPath, { ids })).data
  }

  /**
     * Remove categories.
     * @param ids
     */
  async detach (ids: string[]): Promise<void> {
    await this.axios.delete<ICategory[]>(this.apiPath, { params: { ids } })
  }

  /**
     * Get the path to the categories resources
     */
  get apiPath (): string {
    return `/${this.type}/${this.entity.id}/categories`
  }
}

export interface Categorized<T extends ID> {
  categories: () => CategoryAttachment<T>
}
