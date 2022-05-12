import { useSelector } from "react-redux";
import { selectJob, selectHasJobs } from "../store/jobsSlice";
import NewFilePathJobModal from "./modal/NewFilePathJobModal";
import ActionMenu from "./shell/ActionMenu";
import JobTab from './JobTab';
import { Box } from "@mui/material";
import React from "react";
import ContextMenu from "./shell/ContextMenu";

const stackStyle = {
    display: 'flex',
    flexDirection: "column",
    height: '100%',
    overflow: "hidden",
}

export default function App() {
    const hasJobs = useSelector(selectHasJobs);
    const currentJob = useSelector(selectJob);


    return <React.Fragment>
        <ContextMenu/>
        <NewFilePathJobModal open={!hasJobs} />
        <Box sx={stackStyle}>
            <ActionMenu />
            <JobTab job={currentJob} />
        </Box>
    </React.Fragment>;
}