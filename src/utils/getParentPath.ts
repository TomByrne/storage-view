import { path } from "@tauri-apps/api";
import { splitPath } from "./splitPath";


export function getParentPath(filepath: string): string | undefined {
    const parts = splitPath(filepath);
    if (parts.length < 2) return undefined;
    parts.pop();
    return parts.join(path.sep);
}