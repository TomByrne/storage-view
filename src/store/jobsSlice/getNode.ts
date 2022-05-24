import { get, set } from "./nodeCache";
import { FileNode, JobInfo } from "./types";

export const path_regex = /(.*[/\\](.*))[/\\](.*)/;
export function getNode(job: JobInfo, file_name: string, file_path: string, update?: boolean): FileNode {
    let node;
    if (file_path === job.path) node = job.root;
    else node = get(job.id, file_path);

    if (node && !update) {
        return node;
    }
    if (node) {
        node = { ...node }
    } else {
        node = {
            parent: undefined,
            name: file_name,
            path: file_path,
        };
    }

    if (file_path !== job.path) {
        // Not root node, find parent
        const match = file_path.match(path_regex);
        if (!match || match.length < 4) {
            let msg = "Failed to match path: " + file_path;
            console.log(msg);
            throw new Error(msg);
        }

        const parent_path = match[1];
        const parent_name = match[2];
        const parent = getNode(job, parent_name, parent_path, update);

        node.parent = parent;

        if (!parent.map) parent.map = {};
        else parent.map = { ...parent.map };
        parent.map[file_name] = node;

        if (!parent.children) parent.children = [];
        parent.children = parent.children.filter((n) => n.name !== file_name);
        parent.children.push(node);
    } else {
        node.name = file_name;
        job.root = node;
    }

    set(job.id, file_path, node);

    return node;
}