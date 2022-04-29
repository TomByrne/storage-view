import './TreeMap.scss';
import TreeMapComp from "react-d3-treemap";
import { FileNode, JobInfo } from '../../store/jobsSlice/jobsSlice';

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
function TreeMap({job}:TreeMapProps) {
    return (
        // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
        <TreeMapComp<FileNode>
          id="myTreeMap"
          width={1700}
          height={920}
          data={job.root}
          valueUnit={"MB"}
          hideNumberOfChildren={true}
          hideValue={true}
          levelsToDisplay={3}
          paddingInner={0}
      />
    );
}

export default TreeMap;
