import './TreeMap.scss';
import { FileNode, JobInfo, JobState } from '../../store/jobsSlice/types';
import { createRef, useEffect, useRef } from 'react';
import useRefDimensions from '../../utils/getRefDimensions';
import { TreeMapGraphs, TreeMapGraph } from "./TreeMapGraph";
import { useDispatch } from 'react-redux';

interface TreeMapProps {
    job: JobInfo;
    className: string;
}
function TreeMap({
    job,
    className
}: TreeMapProps) {
    const dispatch = useDispatch();
    const treemapRef = createRef<HTMLDivElement>();
    const dimensions = useRefDimensions(treemapRef);

    let graph = useRef<TreeMapGraph>();
    let onNodeClick = useRef<(node: FileNode, add: boolean) => void>();
    let onNodeRightClick = useRef<(node: FileNode, x:number, y:number) => void>();

    useEffect(() => {
        if(!graph.current) return;
        onNodeClick.current = (node: FileNode, add: boolean) => {
            const path = node.path;
            const isSelected = job.selectedPaths.includes(path);
            let nodeIds: string[];
            if (isSelected) {
                nodeIds = job.selectedPaths.filter(p => p !== path);
            } else {
                nodeIds = add ? [...job.selectedPaths, path] : [path];
            }
            dispatch({ type: "jobs/set-selected", payload: { job: job.id, paths: nodeIds, expandTo:true } });
        }
        onNodeRightClick.current = (node: FileNode, x:number, y:number) => {
            // Must delay, overwise the contextmenu event still makes it to the doc level
            setTimeout(() => {
                console.log("onNodeRightClick: ", node);
                dispatch({ type: "context/set", payload: { element:graph.current?.elem , node, job, x, y  } });
            }, 100);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, job.selectedPaths]);

    useEffect(() => {
        graph.current = TreeMapGraphs.pop() || new TreeMapGraph();
        graph.current.onClick = (node: FileNode, add: boolean) => (onNodeClick.current ? onNodeClick.current(node, add) : null);
        graph.current.onRightClick = (node: FileNode, x:number, y:number) => (onNodeRightClick.current ? onNodeRightClick.current(node, x, y) : null);

        return () => {
            const currGraph = graph.current;
            if(!currGraph) return;
            const graphElem = currGraph.elem;
            if (graphElem.parentElement) {
                graphElem.parentElement.removeChild(graphElem);
            }
            currGraph.clear();
            currGraph.onClick = undefined;
            currGraph.onRightClick = undefined;
            graph.current = undefined;
            TreeMapGraphs.push(currGraph);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.id]);


    useEffect(() => {
        graph.current?.setStageSize(dimensions.width, dimensions.height);
    }, [dimensions, graph]);


    useEffect(() => {
        if (job.state === JobState.done) {
            graph.current?.setRoot(job.root);
        }
    }, [job.root, graph, job.state]);

    useEffect(() => {
        graph.current?.setHighlit(job.selectedPaths);
    }, [job.selectedPaths, graph]);


    useEffect(() => {
        const graphElem = graph.current?.elem;
        if (graphElem && treemapRef.current && graphElem.parentElement !== treemapRef.current) {
            if (graphElem.parentElement) {
                graphElem.parentElement.removeChild(graphElem);
            }
            console.log("Add Pixi: ", graphElem);
            treemapRef.current.appendChild(graphElem);
        }
    }, [treemapRef, graph]);

    return (
        <div id="tree-cont" ref={treemapRef} className={className}>
        </div>
    );
}

export default TreeMap;
