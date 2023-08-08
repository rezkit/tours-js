import type {
    Entity,
    EntityType,
    Paginated,
    PaginatedQuery,
    QueryBoolean,
    SortableQuery,
    ID,
    Fields
} from "./common.js";
import type {AxiosInstance} from "axios";
import {ApiGroup} from "./common.js";
import type {TreeNode} from "../helpers";
import timestamp from "../annotations/timestamp.js";
import type { FieldData } from "./fields";
import {Category, CategoryAttachment, type ICategory} from "./categories";
import type {IHoliday} from "./holidays";
import {Holiday} from "./holidays";

export interface IOrganization extends Entity, TreeNode, Fields {
    id: string;
    rezkit_id: string;
    name: string;
}

export class Organization implements IOrganization {
    private readonly axios: AxiosInstance;
    constructor(values: IOrganization, axios: AxiosInstance) {
        Object.assign(this, values)
        this.axios = axios
    }
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

        response.data = response.data.map(o => new Organization(o, this.axios))

        return response as Paginated<Organization>
    }

    async find(id: string): Promise<Organization> {
        const o = (await this.axios.get<IOrganization>(`/organizations/${id}`)).data
        return new Organization(o, this.axios)
    }
}