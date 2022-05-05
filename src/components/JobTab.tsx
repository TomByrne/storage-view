import { Box } from '@mui/material';
import { JobInfo, JobState } from '../store/jobsSlice/jobsSlice';
import './JobTab.scss';
import TreeMap from './panel/TreeMap';
import TreeView from './panel/TreeView';



interface JobTabProps {
  job: JobInfo;
}
function JobTab({ job }: JobTabProps) {
  if (!job || job.state !== JobState.done) return null;

  return (
    <Box className='job-layout'>
      <TreeView job={job} className="tree-view"/>
      <TreeMap job={job} className="tree-map"/>
    </Box>
  );
}

export default JobTab;
