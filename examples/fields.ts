import { client } from "./helpers.js";


async function main(): Promise<void> {

  const groups = await client.fields('holiday').list()

  for (const group of groups) {
    console.log(`- ${group.label}`)

    for (const field of group.fields) {
      console.log(`---- ${field.label} -- ${field.name} [${field.type}]`);
    }
  }
}


main().then(_ => process.exit(0))
  .catch(console.error)
