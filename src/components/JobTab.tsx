import { JobInfo, JobState } from '../store/jobsSlice/jobsSlice';
import './JobTab.scss';
import TreeMap from './panel/TreeMap';

interface JobTabProps {
  job: JobInfo;
}
function JobTab({ job }: JobTabProps) {
  if (!job || job.state !== JobState.done) return null;

  return (
    <TreeMap job={job} />
  );
}

export default JobTab;
