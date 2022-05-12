export interface FileNode {
    info?: JobFileInfo,
    theme?: FileNodeTheme,
    map?: Record<string, FileNode>,
    children?: FileNode[],
    name: string,
    path: string,
    value?: number,
    child_count?: number,
    // className?: string,

    // Fractions
    // pos_x: number;
    // pos_y: number;
    // pos_w: number;
    // pos_h: number;
}
export interface JobFileInfo {
    path: string,
    name: string,
    is_dir: boolean,
    child_count: number,

    depth: number,
    index: number,
    total: number,

    time: number, // seconds
    size: number, // bytes
}

export interface JobsState {
    lastJobId: number,
    current: number,
    jobs: JobInfo[],
}

export interface JobBrief {
    id: number,
    path: string,
}

export interface JobInfo extends JobBrief {
    root: FileNode,
    name: string,
    state: JobState,
    percent: number, // estimate of job progress, as fract
    expandedPaths: string[],
    selectedPaths: string[],
    hoverPaths: string[],
}

export enum JobState {
    idle = "idle",
    doing = "doing",
    done = "done",
    failed = "failed",
}


export interface FileNodeTheme {
    id: string,
    colors: string[],
}