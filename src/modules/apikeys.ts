import {ApiGroup, Entity, Paginated, PaginatedQuery} from "./common";
import * as qs from "querystring";
import {AxiosInstance} from "axios";

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
    readonly created_at!: string;
    readonly id!: string;
    readonly last_used_at!: string;
    readonly name!: string;
    readonly updated_at!: string;
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

    async list(query?: PaginatedQuery): Promise<Paginated<ApiKey>> {
        let q = ''

        if (query) {
            q += '?' + qs.encode(query as qs.ParsedUrlQuery)
        }

        const { data }: { data: Paginated<IApiKey> } = await this.axios.get(`/api-keys${q}`)
        data.data = data.data.map(k => new ApiKey(k, this.axios))

        return data as Paginated<ApiKey>
    }

    async find(id: string): Promise<ApiKey> {
        const { data } = await this.axios.get(`/api-keys/${id}`)

        return new ApiKey(data, this.axios)
    }

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