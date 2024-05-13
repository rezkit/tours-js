import type {
    Paginated,
    PaginatedQuery,
    QueryBoolean,
    Entity,
    Fields
} from './common.js'
import type { AxiosInstance } from 'axios'
import { ApiGroup } from './common.js'
import timestamp from '../annotations/timestamp.js'
import type {Organization} from "./organizations";

type Price = {
    currency: string
    value: number
}

type Provider = {
    id: string
    organization: Organization
    name: string
    descriptorUrl: string
    enabled: boolean
}

export interface IProduct extends Entity {
    name: string
    provider: Provider
    groupName: string
    description: string | null
    category: string
    prices: Price[]
}

export class Product implements IProduct {
    readonly id!: string
    readonly provider!: Provider
    readonly name!: string
    readonly groupName!: string
    readonly description!: string | null
    readonly category!: string
    readonly prices!: Price[]

    private readonly axios: AxiosInstance
    @timestamp() readonly updated_at!: Date
    @timestamp() readonly created_at!: Date

    constructor (data: IProduct, axios: AxiosInstance) {
        this.axios = axios
        Object.assign(this, data)
    }

    async list (provider: Provider): Promise<Paginated<Product>> {
        const response = (await this.axios.get<Paginated<IProduct>>(`/products`, provider.id))
        response.data = response.data.map(p => new Product(p, this.axios))
        return response as Paginated<Product>
    }

    async reserve (id: string): Promise<Product> {
        const response = await this.axios.post<IProduct>(`/products/reserve/${id}`)
        return new Product(response, this.axios)
    }
}

export class Api extends ApiGroup {
    async list (provider: Provider): Promise<Paginated<Product>> {
        const response = (await this.axios.get<Paginated<IProduct>>(`/products`, provider.id))
        response.data = response.data.map(p => new Product(p, this.axios))
        return response as Paginated<Product>
    }

    async reserve (id: string): Promise<Product> {
        const response = await this.axios.post<IProduct>(`/products/reserve/${id}`)
        return new Product(response, this.axios)
    }
}