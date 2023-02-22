import type {AxiosInstance} from "axios";
import type {IHoliday, UpdateHolidayInput} from "./holidays";
import type {FieldData} from "./fields";


export interface IHolidayVersion extends IHoliday {
    holiday_id: string
}
export class HolidayVersion implements IHolidayVersion {

    private axios: AxiosInstance

    constructor(values: IHolidayVersion, axios: AxiosInstance) {
        this.axios = axios
        Object.assign(this, values)
    }

    async update(params: UpdateHolidayInput): Promise<HolidayVersion> {
        const response = (await this.axios.post<IHolidayVersion>(this.path, params)).data
        Object.assign(this, response)

        return this
    }

    async delete(): Promise<void> {
        await this.axios.delete(this.path)
        return
    }

    code!: string;
    readonly created_at!: string | Date;
    description!: string | null;
    fields!: FieldData;
    holiday_id!: string;
    readonly id!: string;
    introduction!: string | null;
    name!: string;
    ordering!: number;
    published!: boolean;
    readonly updated_at!: string | Date;

    get path(): string {
        return `/holidays/${this.holiday_id}/versions/${this.id}`
    }
}
