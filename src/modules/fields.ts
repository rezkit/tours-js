import { ApiGroup, type Entity, type EntityType, type ReorderCommand } from './common.js'
import type { AxiosInstance } from 'axios'

/**
 * User-defined field data
 *
 * Data for user-defined fields are stored as a mapping of field names to a value datum
 */
export type FieldData = Record<string, any>

export interface FieldDefinition extends Entity {
  type: string
  required: boolean

  /**
   * Field Name,
   *
   * Must contain only letters, numbers, and underscores.
   * Cannot start with a number.
   */
  name: string
  label: string
  ordering: number
}

export interface TextFieldDefinition extends FieldDefinition {
  type: 'text' | 'rich_text'
  min_length?: number | null
  max_length?: number | null
  pattern?: string | null
}

export interface NumberFieldDefinition extends FieldDefinition {
  type: 'number'
  min_value?: number | null
  max_value?: number | null
  precision?: number | null
}

export interface CheckboxFieldDefinition extends FieldDefinition {
  type: 'checkbox'
}

export interface ChoiceFieldDefinition extends FieldDefinition {
  type: 'choice'
  choices: string[]
  multi_select: boolean
}

export interface GroupedFieldDefinitions {
  id: string
  label: string
  ordering: number
  fields: FieldDefinition[]
}

export interface CreateFieldRequest extends Omit<Omit<FieldDefinition, 'id'>, 'ordering'> {
  group_id: string
}

export interface UpdateFieldRequest extends Partial<Omit<CreateFieldRequest, 'name'>> {
  ordering?: ReorderCommand
}

export interface FieldGroup extends Entity {
  label: string
  ordering: number
}

export interface CreateFieldGroupRequest {
  label: string
}

export interface UpdateFieldGroupRequest extends Partial<CreateFieldGroupRequest> {
  ordering?: ReorderCommand
}

export class FieldsApi extends ApiGroup {
  readonly type: EntityType

  constructor (axios: AxiosInstance, type: EntityType) {
    super(axios)
    this.type = type
  }

  async list (): Promise<GroupedFieldDefinitions[]> {
    const { data } = await this.axios.get<GroupedFieldDefinitions[]>(`/${this.type}/fields`)
    return data
  }

  async find (id: string): Promise<FieldDefinition> {
    const { data } = await this.axios.get<FieldDefinition>(`/${this.type}/fields/${id}`)
    return data
  }

  async create (params: CreateFieldRequest): Promise<FieldDefinition> {
    const { data } = await this.axios.post<FieldDefinition>(`/${this.type}/fields`, params)
    return data
  }

  async moveUp (id: string): Promise<number> {
    const params: UpdateFieldRequest = { ordering: 'up' }
    const { data } = await this.axios.patch<FieldDefinition>(`/${this.type}/fields/${id}`, params)
    return data.ordering
  }

  async moveDown (id: string): Promise<number> {
    const params: UpdateFieldRequest = { ordering: 'down' }
    const { data } = await this.axios.patch<FieldDefinition>(`/${this.type}/fields/${id}`, params)
    return data.ordering
  }

  async update (id: string, params: UpdateFieldRequest): Promise<FieldDefinition> {
    const { data } = await this.axios.patch<FieldDefinition>(`/${this.type}/fields/${id}`, params)
    return data
  }

  async destroy (id: string): Promise<void> {
    await this.axios.delete(`/${this.type}/fields/${id}`)
  }

  get groups (): GroupsApi {
    return new GroupsApi(this.axios, this.type)
  }
}

export class GroupsApi extends ApiGroup {
  readonly type: EntityType

  constructor (axios: AxiosInstance, type: EntityType) {
    super(axios)
    this.type = type
  }

  async list (): Promise<FieldGroup[]> {
    const { data } = await this.axios.get<FieldGroup[]>(`/${this.type}/fields/groups`)
    return data
  }

  async create (params: CreateFieldGroupRequest): Promise<FieldGroup> {
    const { data } = await this.axios.post<FieldGroup>(`/${this.type}/fields/groups`, params)
    return data
  }

  async update (id: string, params: UpdateFieldGroupRequest): Promise<FieldGroup> {
    const { data } = await this.axios.patch<FieldGroup>(`/${this.type}/fields/groups/${id}`, params)
    return data
  }

  async destroy (id: string): Promise<void> {
    await this.axios.delete(`/${this.type}/fields/groups/${id}`)
  }
}
