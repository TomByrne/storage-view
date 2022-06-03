import { splitPath } from "./splitPath";


export function getParentPath(filepath: string, sep: string): string | undefined {
    const parts = splitPath(filepath, sep);
    if (parts.length < 2) return undefined;
    parts.pop();
    if (parts.length == 1) return parts[0] + sep; // Root level should always have a slash
    return parts.join(sep);
}