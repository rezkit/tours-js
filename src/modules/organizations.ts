import type {
    Entity,
    Paginated,
    PaginatedQuery,
    SortableQuery,
    Fields
} from "./common.js";
import type {AxiosInstance} from "axios";
import {ApiGroup} from "./common.js";
import type {TreeNode} from "../helpers";
import timestamp from "../annotations/timestamp";
import type {UpdateOrganizationSettings} from "./user";
import type { FieldData } from "./fields.js";

export interface IOrganization extends Entity, TreeNode, Fields {
    rezkit_id: string;
    name: string;

    parent_id: string | null;

    children: IOrganization[];
}

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
    readonly children!: IOrganization[];
    fields!: FieldData;
    parent_id!: string | null;
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

        response.data = response.data.map(this.axios)

        return response as Paginated<Organization>
    }
}