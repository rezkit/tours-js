import type {AxiosInstance} from "axios";
import timestamp from "../annotations/timestamp.js";
import type {UpdateOrganizationSettings, IOrganization} from "./user.js";

export class Organization implements IOrganization {
    private readonly axios: AxiosInstance;

    constructor(data: IOrganization, axios: AxiosInstance) {
        Object.assign(this, data)
        this.axios = axios
    }

    async update(params: UpdateOrganizationSettings): Promise<Organization> {
        const { data } = await this.axios.put<IOrganization>(`/organization/settings`, params)
        Object.assign(this, data)

        return this
    }

    @timestamp() readonly created_at!: Date;
    currencies!: string[];
    deposit_defaults!: { balance_due: number; percentage: number };
    image_settings!: Object[];
    readonly id!: string;
    name!: string;
    rezkit_id!: string;async link(id: string, params?: ImageLinkParams): Promise<string> {
        console.log('kms', params)
        const { data } = await this.axios.get(`/images/${id}/link`, { params })
        console.log('data is here', data)
        return data.link
    }async link(id: string, params?: ImageLinkParams): Promise<string> {
        console.log('kms', params)
        const { data } = await this.axios.get(`/images/${id}/link`, { params })
        console.log('data is here', data)
        return data.link
    }
    readonly updated_at!: Date;
}
