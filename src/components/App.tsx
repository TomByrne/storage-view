import { Box } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectHasJobs, selectJob, selectPendingDeletes } from "../store/jobsSlice";
import JobTab from './JobTab';
import DeleteConfirm from "./modal/DeleteConfirm";
import NewFilePathJobModal from "./modal/NewFilePathJobModal";
import ContextMenu from "./shell/ContextMenu";
import JobTabs from "./shell/JobTabs";

const stackStyle = {
    display: 'flex',
    flexDirection: "column",
    height: '100%',
    overflow: "hidden",
}

export default function App() {
    const hasJobs = useSelector(selectHasJobs);
    const currentJob = useSelector(selectJob);
    const pendingDeletes = useSelector(selectPendingDeletes);
    const dispatch = useDispatch();

    function onKey(e: KeyboardEvent) {
        switch (e.key) {
            case "Delete":
                if (e.ctrlKey || e.shiftKey || e.altKey) return;
                if (pendingDeletes === undefined && (currentJob?.selectedPaths.length || 0) > 0) {
                    const files = [];
                    for (const path of currentJob.selectedPaths) {
                        const file = currentJob.nodeMap[path];
                        if (file) files.push(file);
                    }
                    if (files.length) dispatch({ type: "jobs/delete-files-confirm", payload: { files } });
                }
        }
    }


    useEffect(() => {
        const handler = (event: KeyboardEvent) => onKey(event);
        document.addEventListener("keyup", handler);
        return () => document.removeEventListener("keyup", handler);
    });


    return <React.Fragment>
        <ContextMenu />
        <DeleteConfirm files={pendingDeletes} />
        <NewFilePathJobModal open={!hasJobs} />
        <Box sx={stackStyle}>
            <JobTabs />
            <JobTab job={currentJob} />
        </Box>
    </React.Fragment>;
}