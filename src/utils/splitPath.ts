import { path } from "@tauri-apps/api";

export function splitPath(filepath: string): string[] {
    if (filepath.charAt(filepath.length - 1) === path.sep) {
        filepath = filepath.substring(0, filepath.length - 1);
    }
    return filepath.split(path.sep);
}