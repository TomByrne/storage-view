import './App.scss';
import NewJobDialog from './dialog/NewJobDialog';
import JobTab from './JobTab';
import { useSelector } from 'react-redux';
import { selectJob, JobInfo, JobState } from '../store/jobsSlice/jobsSlice';
import { useState } from 'react';

function App() {
  const job = useSelector(selectJob);
  
  const [showNew, setShowNew] = useState(false);

  function toggleShowNew(){
    setShowNew(!showNew);
  }

  function getMainView(job:JobInfo){
    let ret = [];
    if(job) {
      ret.push(<button onClick={toggleShowNew} >New Scan</button>);
      if(job.state === JobState.done) ret.push(<JobTab job={job}/>);
      else ret.push(<div>Working</div>);
    }
    
    if(!job || showNew) {
      ret.push(<NewJobDialog closable={!!job}/>);
    }

    return ret;
  }

  return (
    <div className="App">
      { getMainView(job) }
    </div>
  );
}

export default App;
