import Axios, { type AxiosRequestConfig, type AxiosInstance, type AxiosResponse } from 'axios'
import * as Modules from './modules.js'
import type Config from './config.js'
import { NotFoundError, ValidationError } from './errors.js'
import type { EntityType } from './modules/common.js'
import type { ListDeparturesQuery } from './modules/departures'
export * from './config.js'
export * as helpers from './helpers.js'
export * from './modules.js'

export const BASE_URL = 'https://api.tours.rezkit.app'

/**
 * Tour Manager API Client
 *
 * API client for connecting to the RezKit Tour Manager
 */
export default class TourManager {
  private readonly axios: AxiosInstance

  /**
     * Create a new API Client instance
     *
     * @param config - Client configuration
     * @param requestConfig - Optional Axios request config overrides.
     */
  constructor (config: Config, requestConfig?: AxiosRequestConfig) {
    this.axios = Axios.create(requestConfig)

    this.axios.defaults.baseURL = config?.base_url ?? BASE_URL

    this.axios.defaults.headers.common = {
      Accept: 'application/json'
    }

    if (typeof (process) !== 'undefined' && process.hasOwnProperty('version')) {
      this.axios.defaults.headers.common['User-Agent'] = `RezKit/Tours (js/runtime:${process.version})`
    }

    this.axios.interceptors.response.use(null, handleResponseError)

    if (config.api_key) {
      this.axios.interceptors.request.use(async (req) => {
        if (typeof config.api_key === 'string') {
          req.headers.set({
            Authorization: `Bearer ${config.api_key}`
          })
        } else if (typeof config.api_key === 'function') {
          const apiKey = await config.api_key(req)

          req.headers.set({
            Authorization: `Bearer ${apiKey}`
          })
        }

        return req
      })
    } else {
      // Interactive/session auth
      this.axios.defaults.withCredentials = true
      this.axios.defaults.xsrfCookieName = 'XSRF-TOKEN'
      this.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'
    }
  }

  get holidays (): Modules.Holidays.Api {
    return new Modules.Holidays.Api(this.axios)
  }

  get user (): Modules.User.Api {
    return new Modules.User.Api(this.axios)
  }

  /**
     * Field Management
     */
  fields (type: EntityType): Modules.Fields.FieldsApi {
    return new Modules.Fields.FieldsApi(this.axios, type)
  }

  /**
     * API Key Management
     */
  get apiKeys (): Modules.ApiKeys.Api {
    return new Modules.ApiKeys.Api(this.axios)
  }

  get images (): Modules.Images.Images {
    return new Modules.Images.Images(this.axios)
  }

  get locations (): Modules.Locations.Locations {
    return new Modules.Locations.Locations(this.axios)
  }

  /**
     * Category Management
     * @param type
     */
  categories (type: EntityType): Modules.Categories.Categories {
    return new Modules.Categories.Categories(this.axios, type)
  }

  content (type: EntityType): Modules.Content.Content {
    return new Modules.Content.Content(this.axios, type)
  }

  departures (params: Partial<ListDeparturesQuery>): Modules.Departures.Departures {
    return new Modules.Departures.Departures(this.axios, params)
  }
}

/**
 * Axios Response Error Handler
 * @param error
 * @private
 */
function handleResponseError (error: any): void {
  if (error.hasOwnProperty('response')) {
    const { response }: { response: AxiosResponse } = error

    switch (response.status) {
      case 422:
        throw new ValidationError(response.data)
      case 404:
        throw new NotFoundError(response.data.message, error.request.url)
    }
  }

  throw error
}
