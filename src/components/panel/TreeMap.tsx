import './TreeMap.scss';
import TreeMapComp from "react-d3-treemap";

interface TreeMapInputData {
  name: string;
  value?: number;
  children?: Array<TreeMapInputData>;
  className?: string;
}

let lastId = 0;

function generateData(depth: number): TreeMapInputData {
  let children: Array<TreeMapInputData> | undefined;
  let value: number | undefined;
  if(depth > 0) {
    children = [];
    const count = Math.random() * 8;
    for(var i=0; i<count; i++) {
      children.push(generateData(depth-1));
    }

  } else {
    value = Math.random() * 10;
  }

  return {
    name: `Test: ${lastId++}`,
    value,
    children,
  }
}

function TreeMap() {
  const data = generateData(5);
    return (
        // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
        <TreeMapComp<TreeMapInputData>
          id="myTreeMap"
          width={1920}
          height={1080}
          data={data}
          valueUnit={"MB"}
          hideNumberOfChildren={true}
          hideValue={true}
          levelsToDisplay={3}
          paddingInner={0}
      />
    );
}

export default TreeMap;
