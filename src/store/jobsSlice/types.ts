export interface FileNode {
    // parent: FileNode | undefined,

    info?: JobFileInfo,
    theme?: FileNodeTheme,
    map?: Record<string, FileNode>,
    children?: FileNode[],
    name: string,
    path: string,
    size?: number,
    child_count?: number,
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

    //TODO: move into a new model
    pendingDeletes: FileNode[] | undefined,
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
    nodeMap: Record<string, FileNode>,
}

export enum JobState {
    invalid = "invalid",
    doing = "doing",
    done = "done",
    failed = "failed",
}


export interface FileNodeTheme {
    id: string,
    colors: string[],
}