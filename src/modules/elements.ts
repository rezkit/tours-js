import {Category, type ICategory} from "./categories.js";
import type {AxiosInstance} from "axios";
import type {Entity, Inventory, Paginated, PaginatedQuery, SortableQuery} from "./common.js";
import {ApiGroup} from "./common.js";
import timestamp from "../annotations/timestamp.js";

export interface IElement extends Entity {

    version_id: string
    is_package: boolean

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
    constraints: { [key: string]: any },
    occupancy: { from: number, to: number }
}

export interface CreateElementParams {
    category_id: string
    name: string
    default_inventory: Inventory
}

export interface UpdateElementParams extends Partial<CreateElementParams> {
}

export class Element implements IElement {

    private readonly axios: AxiosInstance

    constructor(data: IElement, axios: AxiosInstance) {
        Object.assign(this, data)
        this.category = new Category(data.category, axios)
        this.options = data.options.map(o => new ElementOption(o, axios))
        this.axios = axios
    }

    async update(params: UpdateElementParams): Promise<Element> {
        const {data} = await this.axios.patch<IElement>(this.path, params)

        Object.assign(this, data)

        return this
    }

    async delete(): Promise<void> {
        await this.axios.delete(this.path)
        this.deleted_at = new Date()
        return
    }

    balance_due!: number | null;
    category!: Category;
    @timestamp() readonly created_at!: Date;
    readonly id!: string;
    default_inventory!: Inventory;
    is_package!: boolean;
    published!: boolean;
    @timestamp() readonly updated_at!: Date;
    version_id!: string;

    deleted_at?: string | Date;

    readonly options!: ElementOption[]

    get path(): string {
        return `/holidays/versions/${this.version_id}/elements/${this.id}`
    }
}

export class ElementOption implements IElementOption {
    category!: Category;
    constraints!: { [p: string]: any };
    @timestamp() readonly created_at!: Date;
    readonly id!: string;
    is_lead!: boolean;
    name!: string;
    occupancy!: { from: number; to: number };
    price_unit!: PriceUnit;
    published!: boolean;
    @timestamp() readonly updated_at!: Date
    web_bookable!: boolean;

    private readonly axios: AxiosInstance

    constructor(data: IElementOption, axios: AxiosInstance) {
        Object.assign(this, data)

        this.axios = axios

        this.category = new Category(data.category, axios)
    }
}

export type ElementSort = 'id' | 'name' | 'created_at' | 'updated_at'

export interface ListElementParams extends PaginatedQuery, SortableQuery<ElementSort> {
}

export class Elements extends ApiGroup {
    private readonly version_id: string

    constructor(axios: AxiosInstance, version_id: string) {
        super(axios);
        this.version_id = version_id
    }

    async list(params: ListElementParams): Promise<Paginated<Element>> {
        const { data } = await this.axios.get<Paginated<IElement>>(`/holidays/versions/${this.version_id}/elements`, { params })
        data.data = data.data.map(e => new Element(e, this.axios))

        return data as Paginated<Element>
    }

    async find(id: string): Promise<Element> {
        const {data} = await this.axios.get<IElement>(`/holidays/versions/${this.version_id}/elements/${id}`)
        return new Element(data, this.axios)
    }

    async create(params: CreateElementParams): Promise<Element> {
        const {data} = await this.axios.post<IElement>(`/holidays/versions/${this.version_id}`, params)
        return new Element(data, this.axios)
    }
}
