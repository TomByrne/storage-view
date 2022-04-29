import './App.scss';
import NewJobDialog from './dialog/NewJobDialog';
import JobTab from './JobTab';
import { useSelector } from 'react-redux';
import { selectJob, JobInfo } from '../store/jobsSlice/jobsSlice';

function getMainView(job:JobInfo){
  // if(job) {
    //return <JobTab/>;
  // } else {
    return <NewJobDialog/>;
  // }
}

function App() {
  const job = useSelector(selectJob);

  return (
    <div className="App">\
      { getMainView(job) }
    </div>
  );
}

export default App;
