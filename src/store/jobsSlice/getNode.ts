import { splitPath } from "../../utils/splitPath";
import { FileNode, JobInfo } from "./types";

export function getNode(job: JobInfo, file_name: string, file_path: string, update?: boolean): FileNode {
    let node;
    if (file_path === job.path) node = job.root;
    else node = job.nodeMap[file_path];

    if (node && !update) {
        return node;
    }
    let existed = false;
    if (node) {
        existed = true;
        node = { ...node }
    } else {
        node = {
            name: file_name,
            path: file_path,
        };
    }

    if (file_path !== job.path) {
        // Not root node, find parent
        const parts = splitPath(file_path, job.separator);
        if (parts.length < 2) {
            let msg = "Failed to match path: " + file_path;
            console.log(msg);
            throw new Error(msg);
        }

        parts.pop();
        let parent_name;
        let parent_path;
        if (parts.length > 1) {
            parent_name = parts[parts.length - 1];
            parent_path = parts.join(job.separator);
        } else {
            // root
            parent_name = parts[0] + job.separator; // Root level should always have a slash
            parent_path = parent_name;
        }
        const parent = getNode(job, parent_name, parent_path, update);

        if (!parent.map) parent.map = {};
        else if (existed) parent.map = { ...parent.map };
        parent.map[file_name] = node;

        if (!parent.children) parent.children = [];
        else if (existed) parent.children = parent.children.filter((n) => n.name !== file_name);
        parent.children.push(node);
    } else {
        node.name = file_name;
        job.root = node;
    }

    job.nodeMap[file_path] = node;

    return node;
}