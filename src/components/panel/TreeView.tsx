import './TreeView.scss';
import MuiTreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import { FileNode, JobInfo } from '../../store/jobsSlice/jobsSlice';
import formatBytes from '../../utils/formatBytes';


interface TreeViewProps {
    job: JobInfo;
    className: string;
}
export default function TreeView({
    job,
    className
}: TreeViewProps) {
    
    const renderTree = (node: FileNode) => {
      if (!node.info) return;
        return <TreeItem key={node.info.path} nodeId={node.info.path} label={`${node.name} (${formatBytes(node.info.size)})`}>
            {Array.isArray(node.children)
                ? node.children.map((child) => renderTree(child))
                : null}
        </TreeItem>
    };

    return (
        <div className={className}>
        <MuiTreeView
            aria-label="rich object"
            defaultCollapseIcon={<Remove />}
            defaultExpanded={['root']}
            defaultExpandIcon={<Add />}
        >
            {renderTree(job.root)}
        </MuiTreeView>
        </div>
    );
}
