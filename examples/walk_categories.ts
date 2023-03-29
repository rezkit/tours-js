import {client} from "./helpers.js";
import { helpers } from "@rezkit/tours"
import type { Category } from "@rezkit/tours/lib/modules/categories";

async function main(): Promise<void> {

    const categories = await client.categories('holiday').list({ limit: 100 })

    const tree = helpers.reconstructTree(categories.data);

    const walk = function(c: Category, depth: number) {
        console.log( '-'.repeat(depth) + ' ' + c.name )

        c.children.forEach(c => walk(c, depth+1));
    }

    tree.forEach(c => walk(c, 1));
}

main().then(_ => process.exit(0)).catch(console.error)
