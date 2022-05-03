import './TreeMap.scss';
import TreeMapComp from "react-d3-treemap";
import { FileNode, JobInfo } from '../../store/jobsSlice/jobsSlice';
import { createRef, RefObject, useEffect, useRef, useState } from 'react';
import React from 'react';
import useRefDimensions from '../../utils/getRefDimensions';
import { worst } from "../../utils/squarify";
import { useDispatch } from 'react-redux';

// interface TreeMapInputData {
//   name: string;
//   value?: number;
//   children?: Array<TreeMapInputData>;
//   className?: string;
// }

// let lastId = 0;

// function generateData(depth: number): TreeMapInputData {
//   let children: Array<TreeMapInputData> | undefined;
//   let value: number | undefined;
//   if(depth > 0) {
//     children = [];
//     const count = Math.random() * 8;
//     for(var i=0; i<count; i++) {
//       children.push(generateData(depth-1));
//     }

//   } else {
//     value = Math.random() * 10;
//   }

//   return {
//     name: `Test: ${lastId++}`,
//     value,
//     children,
//   }
// }


interface TreeMapProps {
  job: JobInfo;
}
function TreeMap({ job }: TreeMapProps) {
  const treemapRef = createRef<HTMLDivElement>()
  const dimensions = useRefDimensions(treemapRef);
  const dispatch = useDispatch();
  

  useEffect(() => {
    if(job.viewW === dimensions.width && job.viewH === dimensions.height) return;
    dispatch({ type:"jobs/setViewSize", payload:{ job:job.id, width:dimensions.width, height:dimensions.height } })
  }, [dimensions, dispatch, job]);

  function getNodeChildren(node: FileNode) {
    if (!node.children) return;
    // return node.children?.map((c) => getNode(c));

    let nodes = [];

    for (const child of node.children) {
      if (!child.value) continue;
      nodes.push(
        getNode(child)
      );
    }

    return <div className="children">
      {nodes}
    </div>
  }

  function getNode(node: FileNode, extraClass: string = '') {
    if (!node.info) return;
    return <div key={node.info?.path} className={'node ' + node.className + ' ' + extraClass} style={{ left: node.pos_x + 'px', top: node.pos_y + 'px', width: node.pos_w + 'px', height: node.pos_h + 'px' }}>
      <div className="label" style={{ top: (10 + node.info.depth * 30) + 'px', left: (10 + node.info.depth * 10) + 'px' }}>{`${node.info.depth + 1}. ${node.info.name}`}</div>
      { getNodeChildren(node) }
    </div>
  }

  return (
    <div id="tree-cont" ref={treemapRef}>
      {getNode(job.root, "root-node")}
      {/* <TreeMapComp<FileNode>
        id="tree-map"
        width={1700}
        height={920}
        data={job.root}
        valueUnit={"MB"}
        hideNumberOfChildren={true}
        hideValue={true}
        disableTooltip={true}
        levelsToDisplay={3}
        paddingInner={0}
      /> */}
    </div>
  );
}

export default TreeMap;
