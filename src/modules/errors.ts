export class ValidationError implements Error {
    message: string;
    public name: string = 'Validation Error';

    errors: { [field: string]: string[] }

    constructor({message, errors}: { message: string; errors: { [field: string]: string[] } }) {
        this.message = message
        this.errors = errors
    }
}
