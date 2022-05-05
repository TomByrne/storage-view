export interface FileNode {
    info?: JobFileInfo,
    map?: Record<string, FileNode>,
    children?: FileNode[],
    name: string,
    path: string,
    value?: number,
    // className?: string,

    // Fractions
    pos_x: number;
    pos_y: number;
    pos_w: number;
    pos_h: number;
}
export interface JobFileInfo {
    path: string,
    name: string,
    is_dir: boolean,

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
    state: JobState,
    aspectRatio: number,
}

export enum JobState {
    idle = "idle",
    doing = "doing",
    done = "done",
    failed = "failed",
}