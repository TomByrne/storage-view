import { IconButton, Tab, Tabs } from "@mui/material";
import { useAppDispatch } from "../../store/hooks";
import { createJob, selectCurrent, selectJobs } from '../../store/jobsSlice';
import { dialog } from '@tauri-apps/api';
import { Add, Close } from "@mui/icons-material";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { JobInfo, JobState } from "../../store/jobsSlice/types";

const style ={
    flexShrink: 0,
}

export default function JobTabs() {

    const dispatch = useAppDispatch();
    const jobs = useSelector(selectJobs);
    const current = useSelector(selectCurrent);

    const tabClick = useCallback((_:any, activeTab:number) => {
        if(activeTab >= jobs.length){
            // Create a new job
            dialog.open({
                title: "Select a path to scan",
                directory: true,
            })
                .then((res: string | string[]) => {
                    const str = (typeof res == "string" ? res : undefined);
                    if (str) dispatch(createJob(str));
                })
        }
        else {
            // Select an existing job
            dispatch({ type:"jobs/set-current", payload:{ current:activeTab } });
        }
    }, [dispatch, jobs.length]);


    function removeJob(id: number) {
        dispatch({ type:"jobs/remove", payload:{ job:id } });
    }

    if(jobs.length === 0) return null;

    function jobLabel(job:JobInfo):string { 
        return `${job.name}` + 
            (job.state === JobState.doing || true ? ` (${Math.round(job.percent * 100)}%)` : "");
    }

    return <Tabs
            value={current}
            onChange={tabClick}
            sx={style}
        >
            {jobs.map(job => (
                <Tab
                    key={job.id}
                    label={
                        <span>
                            {jobLabel(job)}
                            <IconButton
                                component="div"
                                onClick={() => removeJob(job.id)}
                            >
                                <Close fontSize="small"/>
                            </IconButton>

                        </span>
                    }
                />
            ))}
            <Tab icon={<Add />} />
        </Tabs>;
}