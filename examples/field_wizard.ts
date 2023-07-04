import inquirer from 'inquirer'

async function main(): Promise<void> {

  const params = await inquirer.prompt([
    {
      type: 'list',
      name: 'entity_type',
      message: 'Choose Entity Type',
      choices: ['holiday', 'holiday-version', 'departure'],
    },
    {
      type: 'list',
      name: 'type',
      message: 'Field Type',
      choices: [
        { name: 'Text', value: 'text' },
        { name: 'Rich Text', value: 'rich_text' },
        { name: 'Number', value: 'number' },
        { name: 'Checkbox', value: 'checkbox' },
        { name: 'Choice', value: 'choice' },
      ]
    },
    {
      type: 'input',
      name: 'name',
      message: 'Field Name',
      validate(input: string): boolean {
        if (/^[a-z_][a-z0-9_]+$/.test(input)) return true;
        throw Error('Field names must be lowercase letters, numbers, and underscores and cannot start with a number');
      }
    },
    {
      type: 'confirm',
      name: 'required',
      message: 'Required Field?',
      default: false,
    },
    {
      name: 'min_length',
      message: 'Minimum Length',
      type: 'number',
      validate(input: number): boolean {
        if (input === null || (input > 0 && input < 16384)) return true;
        throw new Error('Min length must be blank, or between 1 and 16384');
      },
      when: (answers) => answers.type == 'text' || answers.type == 'rich_text',
      filter(value: string): number | null {
        if (value === "") return null;
        return parseInt(value, 10)
      }
    },

    {
      name: 'max_length',
      message: 'Maximum Length',
      type: 'input',
      validate(value: string, { min_length }: {min_length: number | null}): boolean {
        if (value === "") return true;
        const input = parseInt(value, 10)
        if (min_length !== null && input < min_length) {
          throw Error('Max length must be at least min length');
        }
        return input > 0 && input < 16384;
      },
      when: (answers) => answers.type == 'text' || answers.type == 'rich_text',
      filter(value: string): number | null {
        if (value === "") return null;
        return parseInt(value, 10)
      }
    },

    {
      name: 'min_value',
      message: 'Minimum Value',
      type: 'input',
      when: ({ type }) => type == 'number',
      filter(value: string): number | null {
        if (value === "") return null;
        return parseInt(value, 10)
      },
      validate(value: string): boolean {
        if (value === "") return true;
        const input = parseInt(value, 10)
        return !isNaN(input)
      }
    },

    {
      name: 'precision',
      type: 'number',
      message: 'Precision (decimal places)',
      when: ({ type }) => type == 'number',
      validate(value: number) {
        if (value >= 0 && value <= 9) return true;
        throw Error('Must be between 0 and 9 (inclusive)')
      }
    },
  ])

  console.log(params)

  //await client.fields(params.type).create(params)
}

main().then(() => process.exit(0)).catch(console.error)
