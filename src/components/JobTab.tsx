import { Box } from '@mui/material';
import { JobInfo, JobState } from '../store/jobsSlice/jobsSlice';
import './JobTab.scss';
// import TreeMap from './panel/TreeMap';
import TreeMap2 from './panel/TreeMap2';
import TreeView from './panel/TreeView';



interface JobTabProps {
  job: JobInfo;
}
function JobTab({ job }: JobTabProps) {
  if (!job || job.state !== JobState.done) return null;

  return (
    <Box className='job-layout'>
      <TreeView job={job}/>
      <TreeMap2 job={job} />
    </Box>
  );
}

export default JobTab;
