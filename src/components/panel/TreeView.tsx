import './TreeView.scss';
import MuiTreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import { FileNode, JobInfo } from '../../store/jobsSlice/types';
import formatBytes from '../../utils/formatBytes';
import { useDispatch } from 'react-redux';

interface TreeViewProps {
    job: JobInfo;
    className: string;
}
export default function TreeView({
    job,
    className
}: TreeViewProps) {

    const dispatch = useDispatch();

    function onMouseOver(node: FileNode) {
        dispatch({ type:"jobs/set-hover", payload:{ job:job.id, paths:[node.path] } });
    }

    function getLabel(node: FileNode): string {
        if (node.info) return `${node.name} (${formatBytes(node.info.size)})`;
        else return `${node.name} (calculating...)`;
    }

    const renderTree = (node: FileNode) => {
        return <TreeItem key={node.path} nodeId={node.path} label={getLabel(node)} onMouseOver={() => onMouseOver(node)}>
            {Array.isArray(node.children)
                ? node.children.map((child) => renderTree(child))
                : null}
        </TreeItem>
    };

    const handleToggle = (_: React.SyntheticEvent, nodeIds: string[]) => {
        // setExpanded(nodeIds);
        dispatch({ type:"jobs/set-expanded", payload:{ job:job.id, paths:nodeIds } });
    };

    const handleSelect = (_: React.SyntheticEvent, nodeIds: string[]) => {
        // setSelected(nodeIds);
        dispatch({ type:"jobs/set-selected", payload:{ job:job.id, paths:nodeIds } });
    };

    // useEffect(() => {
    //     dispatch({ type:"jobs/set-selected", payload:{ job:job.id, selected } });
    // }, [selected]);

    return (
        <div className={className}>
            <MuiTreeView
                aria-label="rich object"
                defaultExpanded={['root']}
                defaultCollapseIcon={<Remove />}
                defaultExpandIcon={<Add />}
                multiSelect
                expanded={job.expandedPaths}
                selected={job.selectedPaths}
                onNodeToggle={handleToggle}
                onNodeSelect={handleSelect}
            >
                {renderTree(job.root)}
            </MuiTreeView>
        </div>
    );
}
