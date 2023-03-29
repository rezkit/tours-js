import type {ID} from "./modules/common";

export interface TreeNode extends ID {
    parent_id: string | null;
    children: TreeNode[];
}

/**
 * Reconstruct a flat node list into a tree by setting the children.
 * Requires that child elements be AFTER their parent node in the list.
 *
 * Complexity: Θ(n log(n))
 *
 * @param flat Flat node list
 */
export function reconstructTree<T extends TreeNode>(flat: T[]): T[] {
    const map: { [key: string]: number } = {}, roots = [];
    let i, node = flat[0];

    for (i = 0; i < flat.length; i += 1) {
        map[flat[i].id] = i;
        flat[i].children = [];
    }

    for (i = 0; i < flat.length; i += 1) {
        node = flat[i];
        if (node.parent_id !== null) {
            // If you have dangling branches check that map[node.parentId] exists.
            //
            if (flat[map[node.parent_id]]) {
                flat[map[node.parent_id]].children.push(node);
            }
        } else {
            roots.push(node);
        }
    }

    return roots;
}
