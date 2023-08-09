import type {
    Entity,
    PaginatedQuery,
    SortableQuery,
    Fields
} from "./common.js";
import type {AxiosInstance} from "axios";
import type {TreeNode} from "../helpers";
import timestamp from "../annotations/timestamp";
import type {UpdateOrganizationSettings} from "./user";

export interface IOrganization extends Entity, TreeNode, Fields {
    rezkit_id: string;
    name: string;
}

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