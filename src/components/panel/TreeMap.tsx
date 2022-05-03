import './TreeMap.scss';
import { FileNode, JobInfo } from '../../store/jobsSlice/jobsSlice';
import { createRef, useEffect } from 'react';
import useRefDimensions from '../../utils/getRefDimensions';
import { useDispatch } from 'react-redux';


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

  function getNodeChildren(node: FileNode, maxDepth:number) {
    if (!node.children) return;
    // return node.children?.map((c) => getNode(c));

    let nodes = [];

    for (const child of node.children) {
      if (!child.value) continue;
      nodes.push(
        getNode(child, maxDepth)
      );
    }

    return <div className="children">
      {nodes}
    </div>
  }

  function formatMb(bytes:number): string{
    return (bytes / 1000000).toPrecision(2);
  }

  function getExt(file: string): string {
      const ind = file.lastIndexOf('.');
      if (ind === -1) return "";
      else return file.substring(ind + 1).toLowerCase();
  }

  function getNode(node: FileNode, maxDepth:number, extraClass: string = '') {
    if (!node.info) return;

    
    const className = (node.info.is_dir ? "type-dir" : "type-file") +
                      (!node.info.is_dir ? " ext-" + getExt(node.info.name) : '') +
                      (` depth-${node.info.depth}`) +
                      (maxDepth === 0 ? " max-depth" : '');

    return <div key={node.info?.path} className={'node ' + className + ' ' + extraClass} style={{ left: node.pos_x + 'px', top: node.pos_y + 'px', width: node.pos_w + 'px', height: node.pos_h + 'px' }}>
      <div className="label" style={{ top: (10 + node.info.depth * 30) + 'px', left: (10 + node.info.depth * 10) + 'px' }}>{`${node.info.depth + 1}. ${node.info.name}`} <span>({formatMb(node.info.size)}mb)</span> <span>{!maxDepth ? " - Reached max depth, children omitted" : ''}</span></div>
      { maxDepth > 0 ? getNodeChildren(node, maxDepth-1) : null }
    </div>
  }

  return (
    <div id="tree-cont" ref={treemapRef}>
      {getNode(job.root, 10, "root-node")}
    </div>
  );
}

export default TreeMap;
