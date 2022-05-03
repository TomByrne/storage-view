import { createAsyncThunk, createSlice, current, isDraft } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event';
import squarify from '../../utils/squarify';

export interface JobsState {
    lastJobId: number,
    jobs: JobInfo[],
}

export interface JobBrief {
    id: number,
    path: string,
}

export interface JobInfo extends JobBrief {
    root: FileNode,
    state: JobState,
    viewW: number,
    viewH: number,
}

export enum JobState {
    doing = "doing",
    done = "done",
    failed = "failed",
}

const initialState: JobsState = {
    lastJobId: 0,
    jobs: [],
};

const FILENODE_CACHE: Record<number, Record<string, FileNode>> = {};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(createAsync("C:\"))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
const createAsync = createAsyncThunk(
    'jobs/create',
    async ({ id, path }: JobBrief, { dispatch, getState }) => {
        FILENODE_CACHE[id] = {};
        const unlisten = await listen('create_job/prog', event => {
            const prog = event.payload as JobProgress;
            console.log("create_job/prog: ", prog.job, prog.done, prog.files.length, prog.files);

            dispatch({
                type: "jobs/progress",
                payload: prog,
            });


            if (prog.done) {
                dispatch({
                    type: "jobs/finish",
                    payload: {
                        job: prog.job,
                    },
                });
                unlisten();
            }
        })
        console.log("Begin job");
        await invoke<string>('create_job', { id: id, path: path });
        const state = getState() as RootState;
        const job = state.jobs.jobs.find(j => j.id === id);
        if (job && job.state !== JobState.done) {
            delete FILENODE_CACHE[id];
            await dispatch({
                type: "jobs/set-state",
                payload: {
                    job: id,
                    state: JobState.failed,
                },
            });
            console.error("Job didn't seem to complete properly");
        }
    }
);

function updateJobFile(job: JobInfo, file: JobFileInfo) {
    if (file.name === "src")
        console.log("updateJobFile.start: ", job, file);
    let node: FileNode = getNode(job, file.name, file.path, true);
    node.info = file;
    node.name = file.name;
    node.value = file.size;
    node.className = (file.is_dir ? "type-dir" : "type-file") +
        (!file.is_dir ? " ext-" + getExt(file.name) : '')
        ;
}

function getExt(file: string): string {
    const ind = file.lastIndexOf('.');
    if (ind === -1) return "";
    else return file.substring(ind + 1);
}

const path_regex = /(.*(\\|\/)(.*))(\\|\/).*/;
function getNode(job: JobInfo, file_name: string, file_path: string, update?: boolean): FileNode {
    let node;
    if (file_path === job.path) node = job.root;
    else node = FILENODE_CACHE[job.id][file_path];

    if (node && (!update /*|| !isDraft(node)*/)) {
        return node;
    }
    if (node) {
        node = { ...node }
    } else {
        node = {
            name: file_name,

            pos_x: 0,
            pos_y: 0,
            pos_w: 0,
            pos_h: 0,
        };
    }

    if (file_path !== job.path) {
        // Not root node, find parent
        const match = file_path.match(path_regex);
        if (!match || match.length < 4) {
            let msg = "Failed to match path: " + file_path;
            console.log(msg);
            throw new Error(msg);
        }

        const parent_path = match[1];
        const parent_name = match[3];
        const parent = getNode(job, parent_name, parent_path, update);

        if (!parent.map) parent.map = {};
        else parent.map = { ...parent.map };
        parent.map[file_name] = node;

        if (!parent.children) parent.children = [];
        parent.children = parent.children.filter((n) => n.name !== file_name);
        parent.children.push(node);
    } else {
        job.root = node;
    }

    FILENODE_CACHE[job.id][file_path] = node;

    return node;
}

export const jobsSlice = createSlice({
    name: 'jobs',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        progress: (state, action) => {
            //state = { ...state };
            const progress: JobProgress = action.payload;
            const job = state.jobs.find(j => j.id === progress.job);
            if (!job) {
                console.warn(`Ignoring update for expired job: ${progress.job}`, progress);
                return
            }
            const new_job = { ...job };
            // state.jobs = state.jobs.map((j) => j.id === progress.job ? new_job : j );
            for (const file of progress.files) updateJobFile(new_job, file);

            //return state;
            const ret = {
                ...state,
                jobs: state.jobs.map((j) => j.id === progress.job ? new_job : j)
            }

            return ret;
        },
        "file-update": (state, action) => {
            const payload: { job: number, file: JobFileInfo } = action.payload;
            const job = state.jobs.find(j => j.id === payload.job);
            if (!job) {
                console.warn(`Ignoring update for expired job: ${payload.job}`, action.payload);
                return
            }
            updateJobFile(job, payload.file);
        },
        setViewSize(state, action) {
            const job = state.jobs.find(j => j.id === action.payload.job);
            if (!job) {
                console.warn(`Ignoring update for expired job: ${action.payload.job}`, action.payload);
                return
            }
            job.viewW = action.payload.width;
            job.viewH = action.payload.height;
            if (job.state === JobState.done) squarify(job.root, 0, 0, job.viewW, job.viewH);
        },
        "set-state": (state, action) => {
            const job = state.jobs.find(j => j.id === action.payload.job);
            if (job) job.state = action.payload.state;
            else console.warn(`Couldn't find job to update state job: ${action.payload.job}`, action.payload.state);
        },
        "finish": (state, action) => {
            const job = state.jobs.find(j => j.id === action.payload.job);
            if (!job) {
                console.warn(`Couldn't find job to finish: ${action.payload.job}`);
                return
            }
            job.state = JobState.done;
            squarify(job.root, 0, 0, job.viewW, job.viewH);
            console.log("Job finished", current(job));
        }
    },
    // The `extraReducers` field lets the slice handle actions defined elsewhere,
    // including actions generated by createAsyncThunk or in other slices.
    extraReducers: (builder) => {
        builder
            .addCase(createAsync.pending, (state, action) => {
                console.log("createAsync.pending", state, action);
                const jobBrief: JobBrief = action.meta.arg;
                const job = state.jobs.find(j => j.id === jobBrief.id);
                if (job) {
                    console.error("Job with ID already exists: ", job);
                    return;
                }
                state.jobs.push({
                    ...jobBrief,
                    state: JobState.doing,
                    viewW: 1920,
                    viewH: 1080,
                    root: {
                        name: "",

                        pos_x: 0,
                        pos_y: 0,
                        pos_w: 0,
                        pos_h: 0,
                    },
                });
            })
    },
});

export const findJob = (state: RootState, job: number) => state.jobs.jobs.find(j => j.id === job);

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectJob = (state: RootState) => state.jobs.jobs[state.jobs.jobs.length - 1];

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const createJob = (path: string): AppThunk => (
    dispatch,
    getState
) => {
    console.log("createJob: ", path);
    const state = getState();
    const currJob = selectJob(state);
    const id = state.jobs.lastJobId + 1;
    if (currJob) {
        if (currJob.state === JobState.doing) {
            console.warn("Job already running, aborting");
            return;
        }

    }
    dispatch(createAsync({ id, path }));
};

export default jobsSlice.reducer;


export interface FileNode {
    info?: JobFileInfo,
    map?: Record<string, FileNode>,
    children?: FileNode[],
    name: string,
    value?: number,
    className?: string,

    //TODO: remove
    pos_x: number;
    pos_y: number;
    pos_w: number;
    pos_h: number;
}

// From Rust
export interface JobProgress {
    job: number,
    files: JobFileInfo[],
    done: boolean,
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
