import { useSelector } from "react-redux";
import { selectJob, selectHasJobs } from "../store/jobsSlice/jobsSlice";
import NewFilePathJobModal from "./modal/NewFilePathJobModal";
import ActionMenu from "./shell/ActionMenu";
import JobTab from './JobTab';
import { Box } from "@mui/material";
import React from "react";

const stackStyle = {
    display: 'flex',
    flexDirection: "column",
    height: '100%',
}
const jobStyle = {
    flexGrow: 1,
}

export default function App() {
    const hasJobs = useSelector(selectHasJobs);
    const currentJob = useSelector(selectJob);

    return <React.Fragment>
        <NewFilePathJobModal open={!hasJobs} />
        <Box sx={stackStyle}>
            <ActionMenu />
            <Box sx={jobStyle}>
                <JobTab job={currentJob} />
            </Box>
        </Box>
    </React.Fragment>;
}