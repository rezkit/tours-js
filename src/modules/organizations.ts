import type { AxiosInstance } from 'axios'
import timestamp from '../annotations/timestamp.js'
import type {UpdateOrganizationSettings, IOrganization, ImagePreset, OrganizationEnvironment} from './user.js'

export class Organization implements IOrganization {
  private readonly axios: AxiosInstance

  constructor (data: IOrganization, axios: AxiosInstance) {
    Object.assign(this, data)
    this.axios = axios
  }

  async update (params: UpdateOrganizationSettings): Promise<Organization> {
    const { data } = await this.axios.put<IOrganization>('/organization/settings', params)
    Object.assign(this, data)

    return this
  }

  @timestamp() readonly created_at!: Date
  currencies!: string[]
  deposit_defaults!: { balance_due: number, percentage: number }
  image_settings!: ImagePreset[]
  readonly id!: string
  name!: string
  environment!: OrganizationEnvironment
  rezkit_id!: string
  readonly updated_at!: Date
}
