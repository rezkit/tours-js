import type {Entity, Inventory, Paginated, PaginatedQuery, SortableQuery} from "./common.js";
import type {Categorized} from "./categories.js";
import {Category, CategoryAttachment} from "./categories.js";
import type {AxiosInstance} from "axios";
import timestamp from "../annotations/timestamp.js";
import {ApiGroup} from "./common.js";
import type {IElementOption, PriceUnit} from "./elements.js";


export type DepartureRangeType = 'fixed' | 'fixed_duration' | 'flexible'

export interface IDeparture extends Entity {
    start: Date
    end: Date

    range_type: DepartureRangeType

    version_id: string

    source_id: string | null

    inventory: Inventory

    readonly elements: IDepartureElement[]
}

export interface CreateDepartureRequest {
    version_id?: string
    range_type: DepartureRangeType
    start: Date
    end: Date
    inventory: Inventory
}

export type UpdateDepartureRequest = Partial<Omit<CreateDepartureRequest, 'version_id'>>

export class Departure implements IDeparture, Categorized<Departure> {
    @timestamp() readonly created_at!: Date;
    readonly id!: string;

    @timestamp() readonly updated_at!: Date;

    private readonly axios: AxiosInstance

    constructor(data: IDeparture, axios: AxiosInstance) {
        this.axios = axios
        this.apply(data)
    }

    private apply(data: IDeparture) {
        Object.assign(this, data)
        this.elements = data.elements.map(e => new DepartureElement(e, this.axios))
    }

    async update(params: UpdateDepartureRequest): Promise<Departure> {
        const { data } = await this.axios.patch<IDeparture>(this.path, params)
        this.apply(data)
        return this
    }

    async destroy(): Promise<void> {
        await this.axios.delete(this.path)
    }

    categories(): CategoryAttachment<Departure> {
        return new CategoryAttachment<Departure>(this.axios, 'departure', this);
    }

    @timestamp() readonly end!: Date;
    readonly inventory!: Inventory;
    readonly source_id!: string | null;
    @timestamp() readonly start!: Date;
    readonly version_id!: string;

    elements!: DepartureElement[]
    readonly range_type!: DepartureRangeType;

    get path(): string {
        return `/holidays/departures/${this.id}`
    }
}

export interface IDepartureElement extends Entity {
    readonly inventory: Inventory

    readonly balance_due: {
        calculated: boolean
        date: Date
    }

    readonly options: IDepartureElementOption[]
}

export class DepartureElement implements IDepartureElement {

    private readonly axios: AxiosInstance

    constructor(data: IDepartureElement, axios: AxiosInstance) {
        Object.assign(this, data)
        this.options = data.options.map(o => new DepartureElementOption(o, axios))
        this.axios = axios
    }

    readonly balance_due!: {
        calculated: boolean;
        date: Date
    };

    @timestamp() readonly created_at!: Date;
    readonly id!: string;
    readonly inventory!: Inventory;
    readonly options!: DepartureElementOption[];
    @timestamp() readonly updated_at!: Date;
}

export interface IDepartureElementOption extends IElementOption {
    prices: IPrice[]
}

export class DepartureElementOption implements IDepartureElementOption {
    readonly category!: Category;
    readonly constraints!: { [p: string]: any };
    @timestamp() readonly created_at!: Date;
    readonly id!: string;
    readonly is_lead!: boolean;
    readonly name!: string;
    readonly occupancy!: { from: number; to: number };
    readonly price_unit!: PriceUnit;
    readonly prices!: Price[];
    readonly published!: boolean;
    @timestamp() readonly updated_at!: Date;
    readonly web_bookable!: boolean;

    private readonly axios: AxiosInstance

    constructor(data: IDepartureElementOption, axios: AxiosInstance) {
        Object.assign(this, data)
        this.prices = data.prices.map(p => new Price(p, axios))
        this.category = new Category(data.category, axios)
        this.axios = axios
    }

    /**
     * Get the price for a given currency
     * @param currency
     */
    price(currency: string): Price | undefined {
        return this.prices.find(p => p.currency === currency)
    }
}

export interface IPrice extends Entity {
    readonly currency: string
    readonly on_sale: boolean
    readonly initialized: boolean
    readonly value: string
    readonly previous_value: string | null

    readonly deposit: {
        calculated: boolean
        value: string
    }
}

export interface UpdatePriceParams {
    value?: string | number
    previous_value?: string | number
    on_sale?: boolean
    deposit?: string | number | null
}

export class Price implements IPrice {
    @timestamp() readonly created_at!: Date;
    readonly currency!: string;
    readonly deposit!: { calculated: boolean; value: string };
    readonly id!: string;
    readonly initialized!: boolean;
    readonly on_sale!: boolean;
    readonly previous_value!: string | null;
    @timestamp() readonly updated_at!: Date;
    readonly value!: string;

    private readonly axios: AxiosInstance

    constructor(data: IPrice, axios: AxiosInstance) {
        Object.assign(this, data)
        this.axios = axios
    }

    async update(params: UpdatePriceParams): Promise<Price> {
        const { data } = await this.axios.patch<IPrice>(`/holidays/prices/${this.id}`, params)
        Object.assign(this, data)
        return this
    }
}

export type DepartureSort = 'id' | 'created_at' | 'updated_at' | 'start' | 'end'

export interface ListDeparturesQuery extends PaginatedQuery, SortableQuery<DepartureSort> {
    after?: Date
    before?: Date

    version?: string

    holiday?: string
}

export class Departures extends ApiGroup {

    private readonly constraints: Partial<ListDeparturesQuery>

    constructor(axios: AxiosInstance, constraints?: Partial<ListDeparturesQuery>) {
        super(axios);
        this.constraints = constraints || {}
    }

    async list(params: ListDeparturesQuery): Promise<Paginated<Departure>> {
        params ||= {}
        Object.assign(params, this.constraints)

        const { data } = await this.axios.get<Paginated<IDeparture>>(`/holidays/departures`, { params })
        data.data = data.data.map(d => new Departure(d, this.axios))
        return data as Paginated<Departure>
    }

    async find(id: string): Promise<Departure> {
        const { data } = await this.axios.get<IDeparture>(`/holidays/departures/${id}`)
        return new Departure(data, this.axios)
    }

    async create(params: CreateDepartureRequest): Promise<Departure> {

        if (typeof this.constraints.version === 'string') {
            params.version_id = this.constraints.version
        }

        const { data } = await this.axios.post<IDeparture>(`/holidays/departures`, params)
        return new Departure(data, this.axios)
    }

    async restore(id: string): Promise<Departure> {
        const { data } = await this.axios.put<IDeparture>(`/holidays/departures/${id}/restore`)
        return new Departure(data, this.axios)
    }
}
