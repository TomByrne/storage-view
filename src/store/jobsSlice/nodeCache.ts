import { FileNode } from "./types";


const FILENODE_CACHE: Record<number, Record<string, FileNode>> = {};

export function create(id:number) {
    /*if(!FILENODE_CACHE[id])*/ FILENODE_CACHE[id] = {};
}

export function clear(id:number) {
    delete FILENODE_CACHE[id];
}

export function get(id:number, path:string): FileNode | undefined {
    return FILENODE_CACHE[id][path];
}

export function set(id:number, path:string, node:FileNode): void {
    FILENODE_CACHE[id][path] = node;
}

export function remove(id:number, path:string): void {
    delete FILENODE_CACHE[id][path];
}