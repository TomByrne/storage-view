import { splitPath } from "./splitPath";


export function getPathName(filepath: string, sep: string): string {
    const parts = splitPath(filepath, sep);
    return parts[parts.length - 1];
}