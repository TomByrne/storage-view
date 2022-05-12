import { FileNode, JobInfo } from "../jobsSlice/types";

export interface ContextState {
    element: HTMLElement | undefined,
    job: JobInfo | undefined,
    node: FileNode | undefined,
}