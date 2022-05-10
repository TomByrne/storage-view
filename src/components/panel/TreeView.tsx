import './TreeView.scss';
import MuiTreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import { FileNode, JobInfo } from '../../store/jobsSlice/types';
import formatBytes from '../../utils/formatBytes';

interface TreeViewProps {
    job: JobInfo;
    className: string;
}
export default function TreeView({
    job,
    className
}: TreeViewProps) {

    function getLabel(node: FileNode): string {
        if(node.info) return `${node.name} (${formatBytes(node.info.size)})`;
        else return `${node.name} (calculating...)`;
    }
    
    const renderTree = (node: FileNode) => {
        return <TreeItem key={node.path} nodeId={node.path} label={getLabel(node)}>
            {Array.isArray(node.children)
                ? node.children.map((child) => renderTree(child))
                : null}
        </TreeItem>
    };

    return (
        <div className={className}>
        <MuiTreeView
            aria-label="rich object"
            defaultExpanded={['root']}
            defaultCollapseIcon={<Remove />}
            defaultExpandIcon={<Add />}
        >
            {renderTree(job.root)}
        </MuiTreeView>
        </div>
    );
}
