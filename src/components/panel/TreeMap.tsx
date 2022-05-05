import './TreeMap.scss';
import { FileNode, JobFileInfo, JobInfo } from '../../store/jobsSlice/types';
import React, { createRef, useEffect } from 'react';
import useRefDimensions from '../../utils/getRefDimensions';
import { useDispatch } from 'react-redux';
import { NATURAL_SIZE } from '../../utils/squarify';
import { Tooltip } from '@mui/material';
import formatBytes from '../../utils/formatBytes';


interface TreeMapProps {
  job: JobInfo;
  className: string;
}
function TreeMap({
  job,
  className
}: TreeMapProps) {
  const treemapRef = createRef<HTMLDivElement>()
  const dimensions = useRefDimensions(treemapRef);
  const dispatch = useDispatch();


  useEffect(() => {
    const aspectRatio = Math.round(dimensions.width / dimensions.height * 10) / 10;
    if (job.aspectRatio === aspectRatio) return;
    dispatch({ type: "jobs/set-aspect-ratio", payload: { job: job.id, aspectRatio } })
  }, [dimensions, dispatch, job]);

  function getNodeChildren(node: FileNode, maxDepth: number) {
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

  

  function getExt(file: string): string {
    const ind = file.lastIndexOf('.');
    if (ind === -1) return "";
    else return file.substring(ind + 1).toLowerCase();
  }

  function getTooltip(node: FileNode, info: JobFileInfo) {
    return <React.Fragment>
      <h3>{info.name}</h3>
      <p><b>Size:</b> {formatBytes(info.size)}</p>
      <p><b>Path:</b> {info.path}</p>
    </React.Fragment>
  }

  function getNode(node: FileNode, maxDepth: number, extraClass: string = '') {
    if (!node.info) return;


    const className = (node.info.is_dir ? "type-dir" : "type-file") +
      (!node.info.is_dir ? " ext-" + getExt(node.info.name) : '') +
      (` depth-${node.info.depth}`) +
      (maxDepth === 0 ? " max-depth" : '');

    const elem =
      <div key={node.info?.path} className={'node ' + className + ' ' + extraClass} style={{ left: node.pos_x + 'px', top: node.pos_y + 'px', width: node.pos_w + 'px', height: node.pos_h + 'px' }}>
        {/* <div className="label" style={{ top: (10 + node.info.depth * 30) + 'px', left: (10 + node.info.depth * 10) + 'px' }}>{`${node.info.depth + 1}. ${node.info.name}`} <span>({formatMb(node.info.size)}mb)</span> <span>{!maxDepth ? " - Reached max depth, children omitted" : ''}</span></div> */}
        {maxDepth > 0 ? getNodeChildren(node, maxDepth - 1) : null}
      </div>;

    if (node.info.is_dir) return elem;
    else return <Tooltip title={getTooltip(node, node.info)}>{elem}</Tooltip>;
  }

  return (
    <div id="tree-cont" className={className} ref={treemapRef}>
      <div id="scale-cont" style={{ transform: `scaleY(${dimensions.height / NATURAL_SIZE}) scaleX(${dimensions.width / (NATURAL_SIZE * job.aspectRatio)})` }}>
        {getNode(job.root, 10, "root-node")}
      </div>
    </div>
  );
}

export default TreeMap;
