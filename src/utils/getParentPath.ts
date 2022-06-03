import { splitPath } from "./splitPath";


export function getParentPath(filepath: string, sep: string): string | undefined {
    const parts = splitPath(filepath, sep);
    if (parts.length < 2) return undefined;
    parts.pop();
    return parts.join(sep);
}