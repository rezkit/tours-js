import type {
  Entity,
  EntityType,
  ID,
  Paginated,
  PaginatedQuery,
  SortableQuery,
  AttachmentResponse,
  ReorderCommand
} from './common.js'
import type { ICategory } from './categories.js'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'
import type { AxiosInstance } from 'axios'
import { Category } from './categories.js'

export interface ImageDimensions {
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export interface IImage extends Entity {
  title: string
  published: boolean
  content: string | null
  dimensions: ImageDimensions
  focus: Point
  file_path: string
  file_size: string
  category: ICategory
  tags: string[]
  ordering?: number
  readonly thumbnail: string
  readonly original: string
}

export interface CreateImageParams {
  title: string
  description?: string
  published?: boolean
  focus_x?: number
  focus_y?: number
  category_id: string
  image: File | Blob
  settings: any
  tags?: string[]
}
export interface UpdateImageParams extends Partial<CreateImageParams> {

}

export interface ImageLinkParams {
  width?: number
  height?: number
  quality?: number
  blur?: number
  auto_optimize?: 'low' | 'medium' | 'high'
  hue?: number
  saturation?: number
  brightness?: number
}

export class Image implements IImage {
  constructor (data: IImage, axios: AxiosInstance) {
    Object.assign(this, data)
    this.category = new Category(data.category, axios)
    this.axios = axios
  }

  private readonly axios: AxiosInstance
  @timestamp() readonly created_at!: Date
  @timestamp() readonly updated_at!: Date
  category!: ICategory
  content!: string | null
  dimensions!: ImageDimensions
  file_path!: string
  file_size!: string
  focus!: Point
  readonly id!: string
  readonly thumbnail!: string
  readonly original!: string
  title!: string
  ordering?: number

  async update (params: UpdateImageParams): Promise<Image> {
    const { data } = await this.axios.patch<IImage>(`/images/${this.id}`, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    Object.assign(this, data)
    this.category = new Category(data.category, this.axios)

    return this
  }

  async link (params?: ImageLinkParams): Promise<string> {
    const { data } = await this.axios.get(`/images/${this.id}/link`, { params })
    return data.link
  }

  published!: boolean
  tags!: string[]
}

export type SortImage = 'ordering' | 'title' | 'id' | 'created_at' | 'updated_at'

export interface ListImageParams extends PaginatedQuery, SortableQuery<SortImage> {
  search?: string
  category?: string
}
export class Images extends ApiGroup {
  async list (params?: ListImageParams): Promise<Paginated<Image>> {
    const { data } = await this.axios.get<Paginated<IImage>>('/images', { params })
    data.data = data.data.map(i => new Image(i, this.axios))
    return data as Paginated<Image>
  }

  async uses<T>(id: string): Promise<T[]> {
    const { data } = await this.axios.get<T[]>(`/images/${id}/uses`)
    return data
  }

  async link (id: string, params?: ImageLinkParams): Promise<string> {
    const { data } = await this.axios.get(`/images/${id}/link`, { params })
    return data.link
  }

  async create (params: CreateImageParams): Promise<Image> {
    const payload = new FormData()

    payload.set('title', params.title)
    payload.set('category_id', params.category_id)
    payload.set('image', params.image)

    if (typeof params.description === 'string') {
      payload.set('description', params.description)
    }

    if (typeof params.tags === 'object' && params.tags.length > 0) {
      params.tags.forEach(t => { payload.append('tags[]', t) })
    }

    if (typeof params.focus_x === 'number' && !isNaN(params.focus_x)) {
      payload.set('focus_x', params.focus_x.toString())
    }

    if (typeof params.focus_y === 'number' && !isNaN(params.focus_y)) {
      payload.set('focus_y', params.focus_y.toString())
    }

    const { data } = await this.axios.post<IImage>('/images', payload)
    return new Image(data, this.axios)
  }

  async detach (id: string): Promise<void> {
    await this.axios.delete(`/images/${id}/`)
  }

  async update (id: string, params: UpdateImageParams): Promise<Image> {
    const { data } = await this.axios.patch<IImage>(`/images/${id}`, params)
    return new Image(data, this.axios)
  }
}

export class ImageAttachment<T extends ID> extends ApiGroup {
  readonly type: EntityType
  readonly entity: T

  constructor (axios: AxiosInstance, type: EntityType, entity: T) {
    super(axios)
    this.type = type
    this.entity = entity
  }

  async list (params?: ListImageParams): Promise<Paginated<Image>> {
    const { data } = await this.axios.get<Paginated<IImage>>(this.path, { params })

    data.data = data.data.map(i => new Image(i, this.axios))
    return data as Paginated<Image>
  }

  async attach (ids: string[]): Promise<AttachmentResponse> {
    const { data } = await this.axios.patch<AttachmentResponse>(this.path, { ids })
    return data
  }

  async replace (ids: string[]): Promise<AttachmentResponse> {
    const { data } = await this.axios.put<AttachmentResponse>(this.path, { ids })
    return data
  }

  async detach (ids: string[]): Promise<void> {
    await this.axios.delete(this.path, { params: { ids } })
  }

  /**
   * Move an image attachment up or down
   * @param id
   * @param ordering
   */
  async move (id: string, ordering: ReorderCommand): Promise<void> {
    await this.axios.post(this.path + `/${id}/order`, { ordering })
  }

  get path (): string {
    return `/${this.type}/${this.entity.id}/images`
  }
}

export interface Imagable<T extends ID> {
  images: () => ImageAttachment<T>
}
