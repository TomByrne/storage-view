import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event';
import squarify from './squarify';
import { startJob, endJob, getNode } from './getNode';
import { FileNode, JobFileInfo, JobInfo, JobsState, JobState } from './types';
import lodash from "lodash";



// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(runJobAsync("C:\"))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
const runJobAsync = createAsyncThunk(
    'jobs/run',
    async (id: number, { dispatch, getState }) => {
        let job = findJob(getState() as RootState, id);
        if(!job) {
            throw "Job not found: " + id;
        }
        job = lodash.cloneDeep(job);
        
        await dispatch({
            type: "jobs/set-state",
            payload: {
                job: id,
                state: JobState.doing,
            },
        });

        // Create a temporary copy of the job to store progress in
        // const tempJob = current(job);

        startJob(id);
        const unlisten = await listen('create_job/prog', event => {
            const prog = event.payload as JobProgress;
            console.log("create_job/prog: ", prog.job, prog.done, prog.files.length, prog.files);

            dispatch({
                type: "jobs/progress",
                payload: { ...prog, job:job },
            });


            if (prog.done) {
                dispatch({
                    type: "jobs/finish",
                    payload: {
                        job: prog.job,
                        root: job?.root,
                    },
                });
                unlisten();
            }
        })
        console.log("Begin job");
        await invoke<string>('create_job', { id: job.id, path: job.path }); // Call out to rust
        job = findJob(getState() as RootState, id);
        if (job && job.state !== JobState.done) {
            endJob(id);
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
    let node: FileNode = getNode(job, file.name, file.path, false);
    node.info = file;
    node.name = file.name;
    node.value = file.size;
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
            if(action.payload.setCurrent) state.current = state.jobs.length;
            const path = action.payload.path;
            const job = {
                id,
                path,
                state: JobState.idle,
                aspectRatio: 1,
                root: {
                    name: "",
                    path: path,

                    pos_x: 0,
                    pos_y: 0,
                    pos_w: 0,
                    pos_h: 0,
                },
            }
            state.jobs.push(job);
            console.log("Created new job: ", job);
        },
        "set-current": (state, action) => {
            const current = action.payload.current;
            if(current < 0 || current >= state.jobs.length) console.warn("Ignoring set current, invalid index: ", current);
            else state.current = current;
        },
        "progress": (state, action) => {
            //state = { ...state };
            const job: JobInfo = action.payload.job;
            const progress: JobProgress = action.payload;
            // const job = state.jobs.find(j => j.id === progress.job);
            // if (!job) {
            //     console.warn(`Ignoring update for expired job: ${progress.job}`, progress);
            //     return
            // }
            // const new_job = { ...job };
            // state.jobs = state.jobs.map((j) => j.id === progress.job ? new_job : j );
            for (const file of progress.files) updateJobFile(job, file);

            // const ret = {
            //     ...state,
            //     jobs: state.jobs.map((j) => j.id === progress.job ? new_job : j)
            // }

            // return ret;
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
        "set-aspect-ratio": (state, action) => {
            const job = state.jobs.find(j => j.id === action.payload.job);
            if (!job) {
                console.warn(`Ignoring update for expired job: ${action.payload.job}`, action.payload);
                return
            }
            job.aspectRatio = action.payload.aspectRatio;
            if (job.state === JobState.done) squarify(job.root, job.aspectRatio);
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
            const root = action.payload.root;
            if(root) {
                job.root = root;
            }
            job.state = JobState.done;
            squarify(job.root, job.aspectRatio);
            console.log("Job finished");
        },
        "remove": (state, action) => {
            const index = state.jobs.findIndex(j => j.id === action.payload.job);
            if (index === -1) {
                console.warn(`Couldn't find job to remove: ${action.payload.job}`);
                return
            }
            if(state.current >= index) state.current--;
            state.jobs.splice(index, 1);
        },
        "reset":(state, action) => {
            const job = state.jobs.find(j => j.id === action.payload.job);
            if (!job) {
                console.warn(`Couldn't find job to restart: ${action.payload.job}`);
                return;
            }
            if(job.state === JobState.doing) {
                console.warn(`Can't restart running job: ${action.payload.job}`);
                return;
            }
            job.state = JobState.idle;

            //TODO: see if we can skip this
            job.root = {
                name: "",
                path: job.path,

                pos_x: 0,
                pos_y: 0,
                pos_w: 0,
                pos_h: 0,
            }
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
        payload: { path, setCurrent:true },
    })
    const job = selectJob(getState());
    if(job) dispatch(runJobAsync(job.id));
};

export const restartJob = (id: number): AppThunk => (
    dispatch,
    getState,
) => {
    console.log("restartJob: ", id);
    dispatch({
        type: "jobs/reset",
        payload: { id },
    })
    const job = findJob(getState(), id);
    if(job) dispatch(runJobAsync(job.id));
};

export default jobsSlice.reducer;


// From Rust
export interface JobProgress {
    job: number,
    files: JobFileInfo[],
    done: boolean,
}