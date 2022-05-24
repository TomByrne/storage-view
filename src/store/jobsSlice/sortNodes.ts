import { FileNode } from "./types";

export default function sortNodes(node:FileNode) {
    if(!node.children) return;
    node.children.sort((f1, f2) => (f2.size || 0) - (f1.size || 0));
    for(const child of node.children) {
        sortNodes(child);
    }
}