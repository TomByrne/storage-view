import './TreeMap2.scss';
import { JobInfo, JobState } from '../../store/jobsSlice/jobsSlice';
import { createRef, useEffect, useRef } from 'react';
import useRefDimensions from '../../utils/getRefDimensions';
import { TreeMapGraph } from "./TreeMapGraph";

interface TreeMapProps {
    job: JobInfo;
}
function TreeMap({ job }: TreeMapProps) {
    const treemapRef = createRef<HTMLDivElement>();
    const dimensions = useRefDimensions(treemapRef);

    let graph = useRef<TreeMapGraph>();

    useEffect(() => {
        graph.current = new TreeMapGraph();


        return () => graph.current?.destroy();
    }, [graph]);


    useEffect(() => {
        graph.current?.setStageSize(dimensions.width, dimensions.height);
    }, [dimensions, graph]);


    useEffect(() => {
        if(job.state === JobState.done) graph.current?.setJob(job);
    }, [job, graph]);


    useEffect(() => {
        const graphElem = graph.current?.elem;
        if(graphElem && treemapRef.current && graphElem.parentElement !== treemapRef.current) {
            if(graphElem.parentElement){
                graphElem.parentElement.removeChild(graphElem);
            }
            console.log("Add Pixi: ", graphElem);
            treemapRef.current.appendChild(graphElem);
        }
    }, [treemapRef, graph]);

    return (
        <div id="tree-cont" ref={treemapRef}>
        </div>
    );
}

export default TreeMap;
