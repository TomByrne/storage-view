import { Refresh } from '@mui/icons-material';
import { IconButton, Paper } from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { refresh } from '../../store/jobsSlice';
import { JobInfo } from '../../store/jobsSlice/types';
import './JobSummary.scss';


interface TreeViewProps {
    job: JobInfo;
    className: string;
}
export default function TreeView({
    job,
    className
}: TreeViewProps) {

    const dispatch = useAppDispatch();

    function rerun() {
        dispatch(refresh(job.id));
    }

    return (
        <div className={className + " job-summary"}>
            <Paper className={job.state + " job-summary-paper"}>
                {job.state}
                <IconButton onClick={rerun}><Refresh fontSize="small" /></IconButton>
            </Paper>
        </div>
    );
}
