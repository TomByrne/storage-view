import './TreeMap.scss';
import TreeMapComp from "react-d3-treemap";
import { FileNode, JobInfo } from '../../store/jobsSlice/jobsSlice';
import { createRef, RefObject, useRef, useState } from 'react';
import React from 'react';
import useRefDimensions from '../../utils/getRefDimensions';

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

  return (
    <div id="tree-cont" ref={treemapRef}>
      <TreeMapComp<FileNode>
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
      />
    </div>
  );
}

export default TreeMap;
