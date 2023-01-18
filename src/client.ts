import {default as Axios, AxiosRequestConfig, AxiosInstance} from 'axios'
import {Api as HolidaysApi} from "./modules/holidays";
import {Api as UserApi} from './modules/user'
import Config from "./config";

export const BASE_URL = 'https://api.tours.rezkit.app';

export default class TourManager {

    private axios: AxiosInstance

    constructor(config: Config, requestConfig?: AxiosRequestConfig) {
        this.axios = Axios.create(requestConfig)

        this.axios.defaults.baseURL = config?.base_url || BASE_URL

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

    holidays(): HolidaysApi {
        return new HolidaysApi(this.axios)
    }

    user(): UserApi {
        return new UserApi(this.axios)
    }

}
