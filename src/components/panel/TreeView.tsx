import './TreeView.scss';
import MuiTreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import { FileNode, JobInfo } from '../../store/jobsSlice/types';
import formatBytes from '../../utils/formatBytes';
import { useDispatch } from 'react-redux';
import React from 'react';

const dummyTreeItems = [
    <TreeItem className="tree-node" key="dummy" nodeId="dummy" label="Loading..."/>
];

interface TreeViewProps {
    job: JobInfo;
    className: string;
}
export default function TreeView({
    job,
    className
}: TreeViewProps) {

    const dispatch = useDispatch();

    function getLabel(node: FileNode) {
        return <React.Fragment>
            <span className="file-name">{node.name}</span>
            <span className="file-size">{(node.info ? ' (' + formatBytes(node.info.size) + ')' : '(calculating...)')}</span>
        </React.Fragment>;
    }

    function renderChildren(node: FileNode){
        if(!node.children || node.children.length === 0) return null;

        // If not expanded, return a dummy child, for performance
        if(!job.expandedPaths.includes(node.path)) return dummyTreeItems;

        return node.children.map((child) => renderTree(child));
    }

    function onContextMenu(e:React.MouseEvent, node:FileNode) {
        console.log("onContextMenu: ", node);
        dispatch({type:"context/set", payload: { element:e.target, job, node, x:e.pageX, y:e.pageY }});
        e.preventDefault();
        e.stopPropagation();
    }

    const renderTree = (node: FileNode) => {
        return <TreeItem className="tree-node" key={node.path} nodeId={node.path} label={getLabel(node)} onContextMenu={(e) => onContextMenu(e, node)}>
            {renderChildren(node)}
        </TreeItem>;
    };

    const handleToggle = (_: React.SyntheticEvent, nodeIds: string[]) => {
        dispatch({ type:"jobs/set-expanded", payload:{ job:job.id, paths:nodeIds } });
    };

    const handleSelect = (_: React.SyntheticEvent, nodeIds: string[]) => {
        dispatch({ type:"jobs/set-selected", payload:{ job:job.id, paths:nodeIds } });
    };

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