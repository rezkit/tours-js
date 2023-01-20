import {default as Axios, AxiosRequestConfig, AxiosInstance, AxiosError, AxiosResponse} from 'axios'
import * as Modules from './modules'
import Config from "./config";
export * from './config';
import {ValidationError} from "./modules/errors";

export const BASE_URL = 'https://api.tours.rezkit.app';

export default class TourManager {

    private axios: AxiosInstance

    constructor(config: Config, requestConfig?: AxiosRequestConfig) {
        this.axios = Axios.create(requestConfig)

        this.axios.defaults.baseURL = config?.base_url || BASE_URL

        this.axios.interceptors.response.use(null, this.handleError)

        if (config.api_key) {
            this.axios.interceptors.request.use( async (req) => {
                if (typeof config.api_key === 'string') {
                    req.headers.set({
                        'Authorization': `Bearer ${config.api_key}`
                    })
                } else if (typeof config.api_key === 'function') {
                    const api_key = await config.api_key(req)

                    req.headers.set({
                        'Authorization': `Bearer ${api_key}`
                    })
                }

                return req
            })
        } else {
            // Interactive/session auth
            this.axios.defaults.withCredentials = true
            this.axios.defaults.xsrfCookieName = 'XSRF_TOKEN'
            this.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'
        }
    }



    get holidays(): Modules.Holidays.Api {
        return new Modules.Holidays.Api(this.axios)
    }

    get user(): Modules.User.Api {
        return new Modules.User.Api(this.axios)
    }

    get fields(): Modules.Fields.Api {
        return new Modules.Fields.Api(this.axios)
    }

    get apiKeys(): Modules.ApiKeys.Api {
        return new Modules.ApiKeys.Api(this.axios)
    }

    private handleError(error: any) {

        if (error.hasOwnProperty('response')) {
            const { response }: { response: AxiosResponse } = error

            if (response.status === 422) {
                throw new ValidationError(response.data)
            }
        }

        throw error
    }
}
