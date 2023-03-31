import {ApiGroup, type Entity, type Paginated, type PaginatedQuery} from "./common.js";
import type {AxiosInstance} from "axios";
import timestamp from "../annotations/timestamp.js";

interface IApiKey extends Entity {
    name: string

    abilities: string[]

    last_used_at: string
}

export class ApiKey implements IApiKey {

    private axios: AxiosInstance

    /**
     * Create a new API key from Axios {@see IApiKey} values
     *
     * @param values
     * @param axios
     */
    constructor(values: IApiKey, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    /**
     * Delete the API key
     */
    async delete(): Promise<void> {
        await this.axios.delete(`/api-keys/${this.id}`)
    }

    /**
     * Update the API Key
     *
     * @param params
     */
    async update(params: UpdateApiKeyRequest): Promise<ApiKey> {
        const { data } = await this.axios.patch(`/api-keys/${this.id}`, params)
        Object.assign(this, data)

        return this
    }

    readonly abilities!: string[];
    @timestamp() readonly created_at!: Date;
    readonly id!: string;
    readonly last_used_at!: string;
    readonly name!: string;
    @timestamp() readonly updated_at!: Date;
}

export interface CreateApiKeyRequest {
    name: string

    abilities?: string[]
}

export type UpdateApiKeyRequest = Partial<CreateApiKeyRequest>

export interface CreateApiKeyResponse {
    plainTextToken: string
    accessToken: ApiKey
}

export class Api extends ApiGroup {

    /***
     * List API Keys
     *
     * @param params - List query parameters
     * @example List Keys
     *
     *  import TourManager from '@rezkit/tours'
     *  const client = new TourManager({ api_key })
     *  const keys = await client.apiKeys.list({ page: 1, limit: 50 })
     *
     */
    async list(params?: PaginatedQuery): Promise<Paginated<ApiKey>> {
        const { data }: { data: Paginated<IApiKey> } = await this.axios.get(`/api-keys`, { params })
        data.data = data.data.map(k => new ApiKey(k, this.axios))

        return data as Paginated<ApiKey>
    }

    /**
     * Find a key by ID
     *
     * @param id
     *
     * @example Find API Key
     *
     *  import TourManager from '@rezkit/tours'
     *  const client = new TourManager({ api_key })
     *  const key = await client.apiKeys.get(id)
     */
    async find(id: string): Promise<ApiKey> {
        const { data } = await this.axios.get(`/api-keys/${id}`)

        return new ApiKey(data, this.axios)
    }

    /**
     * Create a new API Key
     *
     * @param params
     *
     * @example Create API Key
     *
     *  import TourManager from '@rezkit/tours'
     *  const client = new TourManager({ api_key })
     *  const key = await client.apiKeys.create({ name: 'My Awesome App' })
     */
    async create(params: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {

        const result = (await this.axios.post(`/api-keys`, params)).data

        result.accessToken = new ApiKey(result.accessToken, this.axios)
        return result as CreateApiKeyResponse
    }

    async update(id: string, params: UpdateApiKeyRequest): Promise<ApiKey> {
        const { data } = await this.axios.patch(`/api-keys/${id}`, params)
        return new ApiKey(data, this.axios)
    }

    async delete(id: string): Promise<void> {
        await this.axios.delete(`/api-keys/${id}`)
    }
}
