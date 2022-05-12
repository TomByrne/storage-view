import './TreeMap.scss';
import { JobInfo, JobState } from '../../store/jobsSlice/types';
import { createRef, useEffect, useRef } from 'react';
import useRefDimensions from '../../utils/getRefDimensions';
import { TreeMapGraph } from "./TreeMapGraph";
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
    let onNodeClick = useRef<(path: string, add: boolean) => void>();

    useEffect(() => {
        if(!graph.current) return;
        onNodeClick.current = (path: string, add: boolean) => {
            const isSelected = job.selectedPaths.includes(path);
            let nodeIds: string[];
            if (isSelected) {
                nodeIds = job.selectedPaths.filter(p => p !== path);
            } else {
                nodeIds = add ? [...job.selectedPaths, path] : [path];
            }
            dispatch({ type: "jobs/set-selected", payload: { job: job.id, paths: nodeIds, expandTo:true } });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, job.selectedPaths]);

    useEffect(() => {
        graph.current = new TreeMapGraph();
        graph.current.onClick = (path: string, add: boolean) => (onNodeClick.current ? onNodeClick.current(path, add) : null);

        return () => graph.current?.destroy();
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
