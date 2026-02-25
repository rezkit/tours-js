import type { AxiosInstance } from 'axios'
import {
  type Entity,
  type Paginated,
  type PaginatedQuery,
  ApiGroup
} from './common.js'
import timestamp from '../annotations/timestamp.js'

export interface ICredentials extends Entity {
  name: string
  public_key: string
  enabled: boolean
}

export interface CreateCredentialsParams {
  name: string
  enabled: boolean
}

export interface UpdateCredentialsParams extends Partial<CreateCredentialsParams> {}

export interface ListCredentialsQuery extends PaginatedQuery, Partial<CreateCredentialsParams> {}

export class Credentials implements ICredentials {
  readonly id!: string
  name!: string
  public_key!: string
  enabled!: boolean

  @timestamp() readonly created_at!: Date
  @timestamp() readonly updated_at!: Date

  private readonly axios: AxiosInstance

  constructor (values: ICredentials, axios: AxiosInstance) {
    Object.assign(this, values)
    this.axios = axios
  }

  async update (params: UpdateCredentialsParams): Promise<Credentials> {
    const { data } = await this.axios.patch<ICredentials>('/organization/credentials')
    Object.assign(this, data)
    return this
  }
}

export class Api extends ApiGroup {
  async list (params?: ListCredentialsQuery): Promise<Paginated<Credentials>> {
    const { data } = await this.axios.get<Paginated<ICredentials>>(this.path, { params })
    data.data = data.data.map(c => new Credentials(c, this.axios))

    return data as Paginated<Credentials>
  }

  async find (id: string): Promise<Credentials> {
    const { data } = await this.axios.get<ICredentials>(this.path + `/${id}`)
    return new Credentials(data, this.axios)
  }

  async create (params: CreateCredentialsParams): Promise<Credentials> {
    const { data } = await this.axios.post<ICredentials>(this.path, params)
    return new Credentials(data, this.axios)
  }

  async update (id: string, params: UpdateCredentialsParams): Promise<Credentials> {
    const { data } = await this.axios.patch<ICredentials>(this.path + `/${id}`, params)
    return new Credentials(data, this.axios)
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get path (): string {
    return '/organization/credentials'
  }
}
