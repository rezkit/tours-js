import type { AxiosInstance } from 'axios'
import {
    Paginated,
    PaginatedQuery,
    QueryBoolean,
    Entity,
    ReorderCommand,
    ID,
    EntityType,
    AttachmentResponse,
    ApiGroup
} from './common.js'
import type { TreeNode } from '../helpers.js'
import timestamp from '../annotations/timestamp.js'

export type CakeTypes = 'text' | 'number' | 'boolean' | 'selection' | 'section'
export type DisplayTypes = 'fieldGroup' |
    'number' |
    'numberStepper' |
    'text' |
    'textArea' |
    'telephone' |
    'email' |
    'transport' |
    'checkbox' |
    'checkboxGroup' |
    'radioGroup' |
    'dropdown'

export interface ICake extends Entity, TreeNode {
    parent_id: string | null
    name: string
    type: CakeTypes
    display_type: DisplayTypes
    label: string
    description: string | null
    published: boolean
    required_to_reserve: boolean
    required_by: number | null
    validation: string | null
    global: boolean
    children: ICake[]
    ordering: number
}

export interface CreateCakeInput {
    parent_id?: string
    name: string
    type: CakeTypes
    display_type: DisplayTypes
    label: string
    description?: string
    published: boolean
    required_to_reserve: boolean
    required_by?: number
    validation?: string
    global: boolean
}

export interface UpdateCakeInput extends Partial<CreateCakeInput> {
    ordering?: ReorderCommand
}

export interface ListCakesQuery extends PaginatedQuery {
    search?: string
    name?: string
    parentId?: string
    type?: string
    published?: QueryBoolean
}

export class Cake implements ICake {
    readonly id!: string
    parent_id!: string | null
    name!: string
    type!: CakeTypes
    display_type!: DisplayTypes
    label!: string
    description!: string | null
    published!: boolean
    required_to_reserve!: boolean
    required_by!: number | null
    validation!: string | null
    global!: boolean
    children!: ICake[]
    ordering!: number

    @timestamp() readonly created_at!: Date
    @timestamp() readonly updated_at!: Date
    deleted_at!: null | string | Date

    private readonly axios: AxiosInstance

    constructor (values: ICake, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    async update (params: UpdateCakeInput): Promise<Cake> {
        const { data } = await this.axios.patch<ICake>(this.path, params)
        Object.assign(this, data)
        return this
    }

    async move (ordering: ReorderCommand): Promise<number> {
        const { data } = await this.axios.patch<ICake>(this.path, { ordering })
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

    get path (): string {
        return `/cakes/${this.id}`
    }
}

export class Api extends ApiGroup {
    async list (params?: ListCakesQuery): Promise<Paginated<Cake>> {
        const { data } = await this.axios.get<Paginated<ICake>>(this.path, { params })
        data.data = data.data.map(c => new Cake(c, this.axios))

        return data as Paginated<Cake>
    }

    async find (id: string): Promise<Cake> {
        const { data } = await this.axios.get<ICake>(this.path + `/${id}`)
        return new Cake(data, this.axios)
    }

    async create (params: CreateCakeInput): Promise<Cake> {
        const { data } = await this.axios.post<ICake>(this.path, params)
        return new Cake(data, this.axios)
    }

    async update (id: string, params: UpdateCakeInput): Promise<Cake> {
        const { data} = await this.axios.patch<ICake>(this.path + `/${id}`, params)
        return new Cake(data, this.axios)
    }

    async delete (id: string): Promise<void> {
        await this.axios.delete(this.path + `/${id}`)
    }

    async restore (id: string): Promise<Cake> {
        const { data } = await this.axios.put<ICake>(this.path + `/${id}/restore`)
        return new Cake(data, this.axios)
    }

    get path (): string {
        return `/cakes`
    }
}

export class CakeAttachment<T extends ID> extends ApiGroup {
    readonly type: EntityType
    readonly entity: T

    constructor (axios: AxiosInstance, type: EntityType, entity: T) {
        super(axios)
        this.type = type
        this.entity = entity
    }

    async list (params?: ListCakesQuery): Promise<Paginated<Cake>> {
        const { data } = await this.axios.get<Paginated<ICake>>(this.path, { params })
        data.data = data.data.map(c => new Cake(c, this.axios))

        return data as Paginated<Cake>
    }

    async attach (ids: string[]): Promise<AttachmentResponse> {
        const { data } = await this.axios.patch<AttachmentResponse>(this.path, { ids })
        return data
    }

    async detach (ids: string[]): Promise<AttachmentResponse> {
        const { data } = await this.axios.delete<AttachmentResponse>(this.path, { params: { ids } })
        return data
    }

    get path (): string {
        return `/${this.type}/${this.entity.id}/cakes`
    }
}

export interface Cakeable<T extends ID> {
    cakes: () => CakeAttachment<T>
}