import { FileNode } from "../store/jobsSlice/types";


export type CommitCallback = (node:FileNode, x:number, y:number, w:number, h:number) => boolean;

export default function squarify(node: FileNode, width:number, height:number, commit:CommitCallback) {
    if(commit(node, 0, 0, width, height)) squarify_recurse(node, 0, 0, width, height, node.value || 0, commit);
}

function squarify_recurse(node: FileNode, x:number, y:number, w: number, h: number, total:number, commit:CommitCallback) {

    if (!node.children) return;


    const children:FileNode[] = node.children.concat();
    children.sort((f1, f2) => (f2.value || 0) - (f1.value || 0))

    let active_x = x;
    let active_y = y;
    let active_w = w;
    let active_h = h;
    let is_row = (active_w < active_h);
    // let row_aspect = is_row ? active_w / active_h : active_h / active_w;
    let edge = is_row ? active_w : active_h;
    let row_aspect = 0;
    let row_start = 0;
    let row_area = 0; // total value/area in row
    let row_size = 0; // dimension in other axis (i.e. width for row, height for column)

    let recurse:Function[] = [];

    let i = 0;
    while (i < children.length) {
        const child = children[i];
        // if (!child.value) {
        //     i++;
        //     continue; // Skip items with no value! (might want to give them a minimum at some point)
        // }
        let child_area = child.value || 0;
        let child_area_norm = ((child_area) / total) * (active_w * active_h);

        // Need to convert from size total units to view units
        let row_area_norm = ((row_area + child_area) / total) * (active_w * active_h);
        let row_size_new = row_area_norm / edge;

        let item_other = child_area_norm / row_size_new;

        // Work out the 'worst' aspect ratio for the item (i.e. the aspect ratio in relation to it's longest side)
        let row_aspect_new = Math.max(item_other / row_size_new, row_size_new / item_other);
        if (row_start !== i && row_aspect_new > row_aspect) {
            // Aspect ratio has become worse, start a new row
            finaliseRow(children, row_start, i, is_row, active_x, active_y, active_w, active_h, w, h, row_size, total, recurse, commit);
            total -= row_area;

            if(is_row) {
                active_y += row_size;
                active_h -= row_size;
            } else{
                active_x += row_size;
                active_w -= row_size;
            }
            is_row = !is_row;
            row_area = 0;
            row_start = i;
            edge = is_row ? active_w : active_h;

        } else {
            // Aspect ratio looking good, continue packing row
            row_area += child_area;
            row_aspect = row_aspect_new;
            row_size = row_size_new;
            i++;
        }
    }
    finaliseRow(children, row_start, i, is_row, active_x, active_y, active_w, active_h, w, h, row_size, total, recurse, commit);

    for(const handler of recurse) handler();
}

function finaliseRow(nodes: FileNode[], start: number, end: number, is_row: boolean, x: number, y: number, w: number, h: number, scopeX:number, scopeY:number, row_size:number, total:number, recurse:Function[], commit:CommitCallback) {
    for (let i = start; i < end; i++) {
        const child = nodes[i];
        const value = (child.value || 0) / total * (w * h);


        let childW = w;
        let childH = h;

        if (is_row) {
            childW = value / row_size;
        } else {
            childH = value / row_size;
        }
        let childX = x;
        let childY = y;

        if(commit(child, x, y, childW, childH)) recurse.push(() => {
            squarify_recurse(child, childX, childY, childW, childH, child.value || 0, commit);
        });

        if (is_row) {
            x += childW;
        } else {
            y += childH;
        }
    }
}