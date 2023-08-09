import type {
    Entity,
    Paginated,
    PaginatedQuery,
    SortableQuery,
} from "./common.js";
import type {AxiosInstance} from "axios";
import {ApiGroup} from "./common.js";
import timestamp from "../annotations/timestamp";
import type {UpdateOrganizationSettings, IOrganization} from "./user";
import type { FieldData } from "./fields.js";

export class Organization implements IOrganization {
    private readonly axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        Object.assign(this)
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
    readonly id!: string;
    name!: string;
    rezkit_id!: string;
    readonly updated_at!: Date;
}

export type OrganizationSortFields = 'id' | 'rezkit_id' | 'name'

export interface OrganizationListQuery extends PaginatedQuery, SortableQuery<OrganizationSortFields> {
    id?: string
    reskit_id?: string
    name?: string
}

export class Api extends ApiGroup {
    async list(params?: OrganizationListQuery): Promise<Paginated<Organization>> {
        const response = (await this.axios.get<Paginated<IOrganization>>(`/organizations`, { params })).data

        response.data = response.data.map(new Organization(this.axios))

        return response as Paginated<Organization>
    }
}