
export function splitPath(filepath: string, sep: string): string[] {
    if (filepath.charAt(filepath.length - 1) === sep) {
        filepath = filepath.substring(0, filepath.length - 1);
    }
    return filepath.split(sep);
}