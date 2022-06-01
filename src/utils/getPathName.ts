import { splitPath } from "./splitPath";


export function getPathName(filepath: string): string {
    const parts = splitPath(filepath);
    return parts[parts.length - 1];
}