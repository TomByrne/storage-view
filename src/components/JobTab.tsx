import { Box, Drawer } from '@mui/material';
import { useState } from 'react';
import { JobInfo } from '../store/jobsSlice/types';
import './JobTab.scss';
import TreeView from './panel/TreeView';
import JobSummary from './panel/JobSummary';
import TreeMap from './panel/TreeMap';

interface JobTabProps {
  job: JobInfo;
}

function JobTab({ job }: JobTabProps) {

  const [open, setopen] = useState(true);
  
  if (!job) return null;


  return <Box className='job-layout' sx={{ display: 'flex' }}>
      <Drawer
        className='job-drawer'
        classes={{ paper: 'job-drawer-paper' }}
        variant="persistent"
        open={open}
        ModalProps={{
          disablePortal: true, // Don't elevate to top level
          keepMounted: true, // Better open performance on mobile.
        }}
      > 
        <JobSummary job={job} className="job-state"/>
        <TreeView job={job} className="tree-view"/>
      </Drawer>
      <TreeMap job={job} className="tree-map"/>
  </Box>
}

export default JobTab;
