import './JobSummary.scss';
import { JobInfo, restartJob } from '../../store/jobsSlice/jobsSlice';
import { IconButton, Paper } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useAppDispatch } from '../../store/hooks';


interface TreeViewProps {
    job: JobInfo;
    className: string;
}
export default function TreeView({
    job,
    className
}: TreeViewProps) {
    
    const dispatch = useAppDispatch();

    function rerun(){
        dispatch(restartJob(job.id));
    }

    return (
        <div className={className + " job-summary"}>
            <Paper className={job.state + " job-summary-paper"}>
                {job.state}
                <IconButton onClick={rerun}><Refresh fontSize="small"/></IconButton>
            </Paper>
        </div>
    );
}
