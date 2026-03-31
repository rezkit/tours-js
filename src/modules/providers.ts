import type { AxiosInstance } from 'axios'
import { ApiGroup, type Entity, type Paginated } from './common.js'
import timestamp from '../annotations/timestamp.js'

export interface IProviders {
  name: string
  descriptorUrl: string
  enabled: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
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

  @timestamp() readonly createdAt!: Date
  @timestamp() readonly updatedAt!: Date

  private readonly axios: AxiosInstance

  constructor (values: IProviders, axios: AxiosInstance) {
    Object.assign(this, values)
    this.axios = axios
  }
}

export class Api extends ApiGroup {
  async list (): Promise<Providers[]> {
    const { data } = await this.axios.get<IProviders[]>(this.path)
    return data.map(p => new Providers(p, this.axios))
  }

  async create (params: CreateProviderParams): Promise<Providers> {
    const { data } = await this.axios.post<IProviders>(this.path, params)
    return new Providers(data, this.axios)
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get path (): string {
    return '/organization/providers'
  }
}
