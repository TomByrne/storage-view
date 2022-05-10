import { FileNode, JobInfo } from "./types";

const FILENODE_CACHE: Record<number, Record<string, FileNode>> = {};

export const path_regex = /(.*(\\|\/)(.*))(\\|\/).*/;
export function getNode(job: JobInfo, file_name: string, file_path: string, update?: boolean): FileNode {
    let node;
    if (file_path === job.path) node = job.root;
    else node = FILENODE_CACHE[job.id][file_path];

    if (node && !update) {
        return node;
    }
    if (node) {
        node = { ...node }
    } else {
        node = {
            name: file_name,
            path: file_path,

            pos_x: 0,
            pos_y: 0,
            pos_w: 0,
            pos_h: 0,
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
        const parent_name = match[3];
        const parent = getNode(job, parent_name, parent_path, update);

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

    FILENODE_CACHE[job.id][file_path] = node;

    return node;
}

export function startJob(id:number) {
    FILENODE_CACHE[id] = {};
}

export function endJob(id:number) {
    delete FILENODE_CACHE[id];
}