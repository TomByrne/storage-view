import { Box, Drawer, Toolbar, Typography, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { useState } from 'react';
import { JobInfo, JobState } from '../store/jobsSlice/jobsSlice';
import './JobTab.scss';
import TreeMap from './panel/TreeMap';
import TreeView from './panel/TreeView';
import JobSummary from './panel/JobSummary';
import InboxIcon from '@mui/icons-material/MoveToInbox';

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
