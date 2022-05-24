import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event';
import { getNode, path_regex } from './getNode';
import { FileNode, JobFileInfo, JobInfo, JobsState, JobState } from './types';
import { getTheme } from '../../utils/themes';
import sortNodes from './sortNodes';
import { path } from '@tauri-apps/api';
import lodash from 'lodash';

let lastId = 0;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(runJobAsync("C:\"))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
const runJobAsync = createAsyncThunk(
    'jobs/run',
    async ({ job, path }: { job: number, path: string }, { dispatch, getState }) => {
        let foundJob = findJob(getState() as RootState, job);
        if (!foundJob) {
            throw new Error("Job not found: " + job);
        }
        let jobCopy: JobInfo = lodash.cloneDeep(foundJob);
        const fstatId = lastId++;

        await dispatch({
            type: "jobs/set-state",
            payload: {
                job: job,
                state: JobState.doing,
            },
        });

        const root = jobCopy.nodeMap[path];
        if(path === jobCopy.path) {
            // root
            clearNode(jobCopy, root);
        } else {
            // not root, must fully remove in case path has been deleted
            clearNode(jobCopy, root, true);
            const parent = getParent(jobCopy, path);
            if(parent && parent.children) {
                parent.child_count = parent.child_count ? parent.child_count - 1 : 0;
                parent.children = parent.children.filter((c) => c.path !== path);
            }
        }
        
        const unlisten = await listen('create_job/prog', event => {
            const prog = event.payload as JobProgress;
            if (prog.job !== fstatId) return;

            console.log("create_job/prog: ", prog.job, prog.done, prog.files.length, prog.files);

            dispatch({
                type: "jobs/progress",
                payload: { ...prog, jobCopy: jobCopy },
            });


            if (prog.done) {
                dispatch({
                    type: "jobs/finish",
                    payload: {
                        job,
                        jobCopy,
                    },
                });
                unlisten();
            }
        })
        console.log("Begin job");
        try {
            await invoke<string>('create_job', { id: fstatId, path }); // Call out to rust
        } catch(e) {
            if(e === "Path not found") {
                calcSize(jobCopy, root, true);
                dispatch({
                    type: "jobs/finish",
                    payload: {
                        job,
                        jobCopy,
                    },
                });
            } else {
                console.error(e);
            }
            unlisten();
        }
        foundJob = findJob(getState() as RootState, job);
        if (foundJob && foundJob.state !== JobState.done) {
            await dispatch({
                type: "jobs/set-state",
                payload: {
                    job: job,
                    state: JobState.failed,
                },
            });
            console.error("Job didn't seem to complete properly");
        }
    }
);

function getParent(job: JobInfo, path: string): FileNode | undefined {
    const match = path.match(path_regex);
    if(!match) return undefined;
    const parent_path = match[1];
    return job.nodeMap[parent_path];
}

function updateJobFile(job: JobInfo, file: JobFileInfo) {
    let node: FileNode = getNode(job, file.name, file.path, false);
    node.info = file;
    node.name = file.name;
    node.size = file.size;
    node.child_count = file.child_count;
    node.theme = getTheme(node);
    const parent = getParent(job, node.path);
    if (node.size && parent) {
        calcSize(job, parent, true);
    }
}

function clearNode(job: JobInfo, node: FileNode, clearMap?: boolean) {
    node.info = undefined;
    node.size = 0;
    node.child_count = 0;
    if (node.children) {
        for (const child of node.children) {
            clearNode(job, child, true);
        }
        node.children = [];
        node.map = {};
    }
    if(clearMap) delete job.nodeMap[node.path];
}

function calcPercent(node: FileNode): number {
    if (!node.children) return 0;
    const count: number = node.child_count || node.children?.length || 0;
    return node.children.reduce((val, c) => {
        if (c.info) return val + 1;
        else if (c.children) return val + calcPercent(c);
        else return val;
    }, 0) / count;
}

function calcSize(job: JobInfo, node: FileNode, recurse: boolean) {
    node.size = 0;
    if (node.children) {
        for (const child of node.children) {
            node.size += child.size || 0;
        }
    }
    const parent = getParent(job, node.path);
    if (recurse && parent) calcSize(job, parent, recurse);
}

const initialState: JobsState = {
    lastJobId: 0,
    current: 0,
    jobs: [],
};


export const jobsSlice = createSlice({
    name: 'jobs',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        "create": (state, action) => {
            const id = state.lastJobId++;
            if (action.payload.setCurrent) state.current = state.jobs.length;
            const path = action.payload.path;
            const match = path.match(path_regex);
            const name = (match ? match[3] || path : path);
            const root = {
                parent: undefined,
                name: name,
                path,
            };
            const job = {
                id,
                path,
                state: JobState.invalid,
                aspectRatio: 1,
                percent: 0,
                name: name,
                root,
                expandedPaths: [path],
                selectedPaths: [],
                hoverPaths: [],
                nodeMap: {[path]:root},
            }
            state.jobs.push(job);
            console.log("Created new job: ", job);
        },
        "set-current": (state, action) => {
            const current = action.payload.current;
            if (current < 0 || current >= state.jobs.length) console.warn("Ignoring set current, invalid index: ", current);
            else state.current = current;
        },
        "progress": (state, action) => {
            //state = { ...state };
            const jobCopy: JobInfo = action.payload.jobCopy;
            const progress: JobProgress = action.payload;

            for (const file of progress.files) updateJobFile(jobCopy, file);

            const jobInfo = state.jobs.find(j => j.id === jobCopy.id);
            if (jobInfo) jobInfo.percent = calcPercent(jobCopy.root);

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
            const jobCopy = action.payload.jobCopy;
            sortNodes(jobCopy.root);
            job.root = jobCopy.root;
            job.nodeMap = jobCopy.nodeMap;
            job.state = JobState.done;
            console.log("Job finished: ", job);
        },
        "remove": (state, action) => {
            const index = state.jobs.findIndex(j => j.id === action.payload.job);
            if (index === -1) {
                console.warn(`Couldn't find job to remove: ${action.payload.job}`);
                return
            }
            if (state.current >= index) state.current--;
            state.jobs.splice(index, 1);
        },
        // "reset": (state, action) => {
        //     const id = action.payload.id;
        //     const job = state.jobs.find(j => j.id === id);
        //     if (!job) {
        //         console.warn(`Couldn't find job to reset: ${id}`);
        //         return;
        //     }
        //     if (job.state === JobState.doing) {
        //         console.warn(`Can't restart running job: ${id}`);
        //         return;
        //     }
        //     job.state = JobState.invalid;

        //     const root = action.payload.root || job.root;

        //     clearNode(id, root);

        //     if (job.root !== root) {
        //         job.percent = calcPercent(job.root);
        //     } else {
        //         job.percent = 0;
        //     }
        // },
        "set-selected": (state, action) => {
            const job = state.jobs.find(j => j.id === action.payload.job);
            if (!job) {
                console.warn(`Couldn't find job to set selected: ${action.payload.job}`);
                return;
            }

            const paths: string[] = action.payload.paths;
            job.selectedPaths = paths;

            if (action.payload.expandTo) {
                const expanded: string[] = [];
                for (const p of paths) {
                    let ind = job.path.length;
                    do {
                        const parentPath = p.substring(0, ind);
                        if (!expanded.includes(parentPath)) expanded.push(parentPath);
                    } while ((ind = p.indexOf(path.sep, ind + 1)) !== -1)
                }
                job.expandedPaths = expanded;
            }
        },
        "set-expanded": (state, action) => {
            const job = state.jobs.find(j => j.id === action.payload.job);
            if (!job) {
                console.warn(`Couldn't find job to set expanded: ${action.payload.job}`);
                return;
            }

            job.expandedPaths = action.payload.paths;
        },
    },
});

export const findJob = (state: RootState, job: number) => state.jobs.jobs.find(j => j.id === job);

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectCurrent = (state: RootState) => state.jobs.current;
export const selectJob = (state: RootState) => state.jobs.jobs[state.jobs.current];
export const selectJobs = (state: RootState) => state.jobs.jobs;
export const selectHasJobs = (state: RootState) => state.jobs.jobs.length > 0;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const createJob = (path: string): AppThunk => (
    dispatch,
    getState,
) => {
    console.log("createJob: ", path);
    dispatch({
        type: "jobs/create",
        payload: { path, setCurrent: true },
    });
    const job = selectJob(getState());
    if (job) dispatch(runJobAsync({ job: job.id, path: job.path }));
};

// export const restartJob = (id: number): AppThunk => (
//     dispatch,
//     getState,
// ) => {
//     console.log("restartJob: ", id);
//     dispatch({
//         type: "jobs/reset",
//         payload: { id },
//     });
//     const job = findJob(getState(), id);
//     if(job) dispatch(runJobAsync({job:job.id, path:job.path, root:job.root}));
// };

export const refresh = (id: number, path?: string): AppThunk => (
    dispatch,
    getState,
) => {
    console.log("refreshPath: ", id, path);
    const job = findJob(getState(), id);
    if (job) {
        if (!path) path = job.path;
        const root = job.nodeMap[path];
        if (!root) {
            console.error("Failed to find node in cache: ", id, path);
            return;
        }
        // dispatch({
        //     type: "jobs/reset",
        //     payload: { id, root },
        // });
        dispatch(runJobAsync({ job: job.id, path }));
    } else {
        console.error("Failed to find job with id: ", id);
    }
};

export default jobsSlice.reducer;


// From Rust
export interface JobProgress {
    job: number,
    files: JobFileInfo[],
    done: boolean,
}