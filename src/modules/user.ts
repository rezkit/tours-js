import {ApiGroup, type Entity, type Paginated} from "./common.js";
import { Organization } from "./organizations.js";
import type { AxiosInstance } from "axios";
import timestamp from "../annotations/timestamp.js";

interface IUser extends Entity {

    /**
     * User's full name
     */
    name: string

    /**
     * User's RezKit ID
     */
    rezkit_id: string

    /**
     * User's Organization ID (tour manager ID)
     */
    organization_id: string

    /**
     * User email
     */
    email: string

    /**
     * User's preferences
     */
    preferences: null
}

export class User implements IUser {

    private axios: AxiosInstance

    constructor(values: IUser, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }

    email!: string;
    id!: string;
    name!: string;
    organization_id!: string;
    preferences!: null;
    rezkit_id!: string;
    @timestamp() readonly created_at!: Date;
    @timestamp() readonly updated_at!: Date;
}

export interface OrganizationSettings {
    currencies: string[]
    deposit_defaults: {
        balance_due: number
        percentage: number
    }
    image_settings?: Object[]
}

export type UpdateOrganizationSettings = Partial<OrganizationSettings>;

export interface IOrganization extends Entity, OrganizationSettings {
    name: string
    rezkit_id: string
}

export class Api extends ApiGroup {

    /**
     * Get the user profile of the API caller
     */
    async user(): Promise<User> {
        const user = (await this.axios.get<IUser>('/user')).data
        return new User(user, this.axios)
    }

    async organization(): Promise<Organization> {
        const { data } = await this.axios.get<IOrganization>('/organization')
        return new Organization(data, this.axios)
    }

    async organizationList(): Promise<Organization[]> {
        const { data } = await this.axios.get<Organization[]>(`/organizations`)

        data.data = data.map((o: any) => new Organization(o, this.axios))
        return data as Organization[]
    }
}
