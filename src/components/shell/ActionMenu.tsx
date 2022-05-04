import { IconButton, Tab, Tabs } from "@mui/material";
import { useAppDispatch } from "../../store/hooks";
import { createJob, selectCurrent, selectJobs } from '../../store/jobsSlice/jobsSlice';
import { dialog } from '@tauri-apps/api';
import { Add, Close } from "@mui/icons-material";
import { useCallback } from "react";
import { useSelector } from "react-redux";

export default function ActionMenu() {

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

    return <Tabs
            value={current}
            onChange={tabClick}
        >
            {jobs.map(job => (
                <Tab
                    key={job.id}
                    label={
                        <span>
                            Job #{job.id}
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