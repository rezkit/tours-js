import type { AxiosInstance } from 'axios'
import { ApiGroup, type Entity, type Paginated } from './common.js'
import timestamp from '../annotations/timestamp.js'

export interface IProviders extends Entity {
  name: string
  descriptorUrl: string
  enabled: boolean
}

export interface CreateProviderParams {
  name: string
  url: string
  public: string
  private: string
}

export class Providers implements IProviders {
  readonly id!: string
  name!: string
  descriptorUrl!: string
  enabled!: boolean

  @timestamp() readonly created_at!: Date
  @timestamp() readonly updated_at!: Date

  private readonly axios: AxiosInstance

  constructor (values: IProviders, axios: AxiosInstance) {
    Object.assign(this, values)
    this.axios = axios
  }
}

export class Api extends ApiGroup {
  async list (): Promise<Paginated<Providers>> {
    const { data } = await this.axios.get<Paginated<IProviders>>('/organization/providers')
    data.data = data.data.map(p => new Providers(p, this.axios))

    return data as Paginated<Providers>
  }

  async create (params: CreateProviderParams): Promise<Providers> {
    const { data } = await this.axios.post<IProviders>('/organization/providers/create', params)
    return new Providers(data, this.axios)
  }
}
