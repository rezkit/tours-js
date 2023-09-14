import type {
  AttachmentResponse,
  Entity,
  EntityType,
  ID,
  Paginated,
  PaginatedQuery,
  QueryBoolean,
  ReorderCommand,
  SortableQuery
} from "./common.js";
import type { Imagable } from "./images.js";
import { ImageAttachment } from "./images.js";
import { Category, CategoryAttachment, type ICategory } from "./categories.js";
import type { AxiosInstance } from "axios";
import timestamp from "../annotations/timestamp.js";
import { ApiGroup } from "./common.js";

export interface IContentItem extends Entity {
  type: EntityType
  title: string
  content: string
  ordering: number
  published: boolean
  alias: string
  category: ICategory
}

export type UpdateContentItemParams = Partial<CreateContentItemParams> &
    { ordering?: ReorderCommand } &
    { alias?: string }

export interface CreateContentItemParams {
  title: string
  content: string
  category_id: string
  published?: boolean
}

export type ContentSort = 'title' | 'ordering' | 'created_at' | 'updated_at'
export interface ListContentsQuery extends PaginatedQuery, SortableQuery<ContentSort> {
  published?: QueryBoolean
  title?: string
  category?: string
  search?: string
}

export class ContentItem implements IContentItem, Imagable<ContentItem> {
  private readonly axios: AxiosInstance;

  constructor(data: IContentItem, axios: AxiosInstance) {
    Object.assign(this, data);
    this.category = new Category(data.category, axios);
    this.axios = axios;
  }

  async destroy(): Promise<void> {
    await this.axios.delete(this.path)
    this.deleted_at = new Date();
  }

  async update(params: UpdateContentItemParams): Promise<ContentItem> {
    const { data } = await this.axios.patch<IContentItem>(this.path, params)

    Object.assign(this, data)
    this.category = new Category(data.category, this.axios)

    return this
  }

  /**
   * Get a list of uses for an item
   *
   * @example
   *
   * const holidays = await item.uses<IHoliday>()
   */
  async uses<T>(): Promise<T[]> {
    const { data } = await this.axios.get<T[]>(this.path + '/uses')
    return data
  }

  async moveUp(): Promise<number> {
    const { data } = await this.axios.patch<IContentItem>(this.path, { ordering: 'up'})
    this.ordering = data.ordering
    return data.ordering
  }

  async moveDown(): Promise<number> {
    const { data } = await this.axios.patch<IContentItem>(this.path, { ordering: 'down'})
    this.ordering = data.ordering
    return data.ordering
  }

  category: Category;
  content!: string;
  @timestamp() readonly created_at!: Date;
  readonly id!: string;
  ordering!: number;
  published!: boolean;
  alias!: string;
  title!: string;
  readonly type!: EntityType;
  @timestamp() readonly updated_at!: Date;
  @timestamp() deleted_at?: Date;

  get path(): string {
    return `/${this.type}/content/${this.id}`
  }
  images(): ImageAttachment<ContentItem> {
    return new ImageAttachment(this.axios, 'content', this)
  }
}

export class Content extends ApiGroup {
  readonly type: EntityType

  constructor(axios: AxiosInstance, type: EntityType) {
    super(axios)
    this.type = type
  }

  async find(id: string): Promise<ContentItem> {
    const { data } =  await this.axios.get<IContentItem>(`/${this.type}/content/${id}`)
    return new ContentItem(data, this.axios)
  }

  async list(params?: ListContentsQuery): Promise<Paginated<ContentItem>> {
    const { data } = await this.axios.get<Paginated<IContentItem>>(`/${this.type}/content`, { params })

    data.data = data.data.map(i => new ContentItem(i, this.axios))

    return data as Paginated<ContentItem>
  }

  async create(params: CreateContentItemParams): Promise<ContentItem> {
    const { data } = await this.axios.post<IContentItem>(`/${this.type}/content`, params)
    return new ContentItem(data, this.axios)
  }

  async destroy(id: string): Promise<void> {
    await this.axios.delete(`/${this.type}/content/${id}`)
  }

  async restore(id: string): Promise<ContentItem> {
    const { data } = await this.axios.put<IContentItem>(`/${this.type}/content/${id}/restore`);
    return new ContentItem(data, this.axios);
  }

  async update(id: string, params: UpdateContentItemParams): Promise<ContentItem> {
    const { data } = await this.axios.patch<IContentItem>(`/${this.type}/content/${id}`, params)
    return new ContentItem(data, this.axios)
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/${this.type}/content/${id}`)
  }

  attached(id: string): ContentAttachment<ID> {
    return new ContentAttachment<ID>(this.axios, this.type, { id })
  }
}

export class ContentAttachment<T extends ID> extends ApiGroup {
  readonly type: EntityType
  readonly entity: T

  constructor(axios: AxiosInstance, type: EntityType, entity: T) {
    super(axios)
    this.type = type
    this.entity = entity
  }

  async list(params: ListContentsQuery): Promise<Paginated<ContentItem>> {
    const { data } = await this.axios.get<Paginated<IContentItem>>(this.path, { params })

    data.data = data.data.map(i => new ContentItem(i, this.axios))
    return data as Paginated<ContentItem>
  }

  async attach(ids: string[]): Promise<AttachmentResponse> {
    const { data } = await this.axios.patch<AttachmentResponse>(this.path, { ids })
    return data
  }

  async replace(ids: string[]): Promise<AttachmentResponse> {
    const { data } = await this.axios.put<AttachmentResponse>(this.path, { ids })
    return data
  }

  async detach(ids: string[]): Promise<void> {
    await this.axios.delete(this.path, { params: { ids }})
  }

  get path(): string {
    return `/${this.type}/${this.entity.id}/content`
  }
}

export interface Contentized<T extends ID> {
  content(): ContentAttachment<T>;
}
