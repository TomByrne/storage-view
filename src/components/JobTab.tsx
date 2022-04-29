import { JobInfo } from '../store/jobsSlice/jobsSlice';
import './JobTab.scss';
import TreeMap from './panel/TreeMap';

interface JobTabProps {
  job: JobInfo;
}
function JobTab({job}:JobTabProps) {
    return (
      <TreeMap job={job}/>
    );
}

export default JobTab;
