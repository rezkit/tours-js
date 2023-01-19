import {ApiGroup, Entity} from "./common";
import {AxiosInstance} from "axios";

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

    created_at!: string;
    email!: string;
    id!: string;
    name!: string;
    organization_id!: string;
    preferences!: null;
    rezkit_id!: string;
    updated_at!: string;

}

export interface Organization extends Entity {
    name: string
    rezkit_id: string
    data: object
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
        return (await this.axios.get<Organization>('/organization')).data
    }
}
