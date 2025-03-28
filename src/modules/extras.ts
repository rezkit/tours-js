import type { AxiosInstance } from 'axios'
import type { FieldData } from './fields.js'
import {
    ApiGroup, AttachmentResponse,
    type Entity, type EntityType,
    type Fields, FieldsQuery, type ID,
    type Paginated,
    type PaginatedQuery,
    type QueryBoolean,
    type ReorderCommand, SortableQuery
} from './common.js'
import timestamp from '../annotations/timestamp.js'
import { Content, ContentAttachment, type Contentized } from './content.js'
import { type Imagable, ImageAttachment } from './images.js'
import { Categories, Categorized, CategoryAttachment } from "./categories";

export interface IExtra extends Entity, Fields {
    name: string
    code: string
    introduction: string | null
    description: string | null
    published: boolean
    ordering: number
}

export interface CreateExtraInput extends Partial<Fields> {
    name: string
    code: string

    introduction?: string | null
    description?: string | null
    published?: boolean | null
}

export interface UpdateExtraInput extends Partial<CreateExtraInput> {
    ordering?: ReorderCommand
}

export class Extra implements IExtra, Categorized<Extra>, Contentized<Extra>, Imagable<Extra> {
    readonly id!: string
    name!: string
    code!: string
    introduction!: string | null
    description!: string | null
    published!: boolean
    ordering!: number

    fields!: FieldData

    @timestamp() readonly created_at!: Date
    @timestamp() readonly updated_at!: Date
    deleted_at!: null | string | Date

    private readonly axios: AxiosInstance

    constructor (values: IExtra, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    async update (params: UpdateExtraInput): Promise<Extra> {
        const { data } = await this.axios.patch<IExtra>(this.path, params)
        Object.assign(this, data)
        return this
    }

    async move (ordering: ReorderCommand): Promise<number> {
        const { data } = await this.axios.patch<IExtra>(this.path, { ordering })
        this.ordering = data.ordering
        return data.ordering
    }

    async delete (): Promise<void> {
        await this.axios.delete(this.path)
        this.deleted_at = new Date()
    }

    async restore (): Promise<void> {
        await this.axios.put(this.path + '/restore')
        this.deleted_at = null
    }

    images (): ImageAttachment<this> {
        return new ImageAttachment(this.axios, 'extra', this)
    }

    categories (): CategoryAttachment<this> {
        return new CategoryAttachment<this>(this.axios, 'extra', this)
    }

    content (): ContentAttachment<this> {
        return new ContentAttachment<this>(this.axios, 'extra', this)
    }

    prices (): ExtraPriceAttachment {
        return new ExtraPriceAttachment(this.axios, this.id)
    }

    get path (): string {
        return `/extras/${this.id}`
    }
}

export interface IExtraPrice extends Entity {
    readonly start: Date
    readonly end: Date
    readonly occupancy: { from: number, to: number }
    readonly currency:  string
    readonly value: number
}

export interface CreateExtraPriceParams {
    start: Date
    end: Date
    occupancy: { from: number, to: number }
    currency: string
    value: number
}

export type UpdateExtraPriceParams = Partial<CreateExtraPriceParams>

export interface ListExtraPriceParams extends PaginatedQuery{
    dates?: {
        start?: Date,
        end?: Date,
    },
    before?: Date
    after?: Date
    occupancy?: {
        from?: number,
        to?: number,
    }
    value?: number
    currency?: string
}

export class ExtraPrice implements IExtraPrice {
    readonly id!: string
    readonly extra_id!: string
    readonly currency!: string
    readonly start!: Date
    readonly end!: Date
    readonly occupancy!: { from: number; to: number }
    readonly value!: number;
    @timestamp() readonly updated_at!: Date
    @timestamp() readonly created_at!: Date

    private readonly axios: AxiosInstance

    constructor (values: IExtraPrice, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    async update (params: UpdateExtraPriceParams): Promise<ExtraPrice> {
        const { data } = await this.axios.patch<IExtraPrice>(this.path, params)
        Object.assign(this, data)
        return this
    }

    async delete(): Promise<void> {
        await this.axios.delete(this.path)
    }

    get path (): string {
        return `/extras/${this.extra_id}/prices/${this.id}`
    }
}

export class ExtraPriceAttachment extends ApiGroup {
    readonly extra_id: string

    constructor (axios: AxiosInstance, extraId: string) {
        super(axios)
        this.extra_id = extraId
    }

    async list (params?: ListExtraPriceParams): Promise<Paginated<ExtraPrice>> {
        const { data } = await this.axios.get<Paginated<IExtraPrice>>(this.path, { params })

        data.data = data.data.map(e => new ExtraPrice(e, this.axios))

        return data as Paginated<ExtraPrice>
    }

    async find (id: string): Promise<ExtraPrice> {
        const { data } = await this.axios.get<IExtraPrice>(this.path + `/${id}`)
        return new ExtraPrice(data, this.axios)
    }

    async create (params: CreateExtraPriceParams): Promise<ExtraPrice> {
        const { data } = await this.axios.post<IExtraPrice>(this.path, params)
        return new ExtraPrice(data, this.axios)
    }

    async update (id: string, params: UpdateExtraPriceParams): Promise<ExtraPrice> {
        const { data } = await this.axios.patch<IExtraPrice>(this.path + `/${id}`, params)
        return new ExtraPrice(data, this.axios)
    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(this.path + `/${id}`)
    }

    async restore (id: string): Promise<ExtraPrice> {
        const { data } = await this.axios.put<IExtraPrice>(this.path + `/${id}/restore`)
        return new ExtraPrice(data, this.axios)
    }

    get path (): string {
        return `/extras/${this.extra_id}/prices`
    }
}

export type ExtraSortFields = 'id' | 'name' | 'code' | 'ordering' | 'created_at' | 'updated_at'

export interface ExtraListQuery extends PaginatedQuery, SortableQuery<ExtraSortFields>, FieldsQuery {
    name?: string
    code?: string
    category?: string
    search?: string
    published?: QueryBoolean
}

export class Api extends ApiGroup {
    async list (params?: ExtraListQuery) {
        const { data } = await this.axios.get<Paginated<IExtra>>(`/extras`, { params })

        data.data = data.data.map(e => new Extra(e, this.axios))

        return data as Paginated<Extra>
    }

    async find (id: string): Promise<Extra> {
        const { data } = await this.axios.get<IExtra>(`/extras/${id}`)
        return new Extra(data, this.axios)
    }

    async create (params: CreateExtraInput): Promise<Extra> {
        const { data } = await this.axios.post<IExtra>(`/extras`, params)
        return new Extra(data, this.axios)
    }

    async update (id: string, params: UpdateExtraInput): Promise<Extra> {
        const { data } = await this.axios.patch<IExtra>(`/extras/${id}`, params)
        return new Extra(data, this.axios)
    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(`/extras/${id}`)
    }

    async restore (id: string): Promise<Extra> {
        const { data } = await this.axios.put(`/extras/${id}/restore`)
        return new Extra(data, this.axios)
    }

    get categories (): Categories {
        return new Categories(this.axios, 'extra')
    }

    get content (): Content {
        return new Content(this.axios, 'extra')
    }
}

export class ExtrasAttachment<T extends ID> extends ApiGroup {
    readonly type: EntityType
    readonly entity: T

    constructor (axios: AxiosInstance, type: EntityType, entity: T) {
        super(axios)
        this.type = type
        this.entity = entity
    }

    async list (params?: ExtraListQuery): Promise<Paginated<Extra>> {
        const { data } = await this.axios.get<Paginated<IExtra>>(this.path, { params })
        data.data = data.data.map(e => new Extra(e, this.axios))

        return data as Paginated<Extra>
    }

    async attach (ids: string[]): Promise<AttachmentResponse> {
        const { data } = await this.axios.put<AttachmentResponse>(this.path, { ids })
        return data
    }

    async detach(ids: string[]): Promise<AttachmentResponse> {
        const { data } = await this.axios.delete<AttachmentResponse>(this.path, { params: { ids } })
        return data
    }

    get path (): string {
        return `/${this.type}/${this.entity.id}/extras`
    }
}
