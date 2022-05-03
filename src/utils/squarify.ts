import { FileNode } from "../store/jobsSlice/jobsSlice";

function finaliseRow(nodes: FileNode[], start: number, end: number, is_row: boolean, x: number, y: number, w: number, h: number, row_size:number, total:number) {
    for (let i = start; i < end; i++) {
        const child = nodes[i];
        const value = (child.value || 0) / total * (w * h);

        child.pos_x = x;
        child.pos_y = y;

        if (is_row) {
            child.pos_h = row_size;
            child.pos_w = value / row_size;
            x += child.pos_w; // reversing stack direction could happen here
        } else {
            child.pos_w = row_size;
            child.pos_h = value / row_size;
            y += child.pos_h; // reversing stack direction could happen here
        }
    }
}

export default function squarify(node: FileNode, x: number, y: number, w: number, h: number) {
    node.pos_x = x;
    node.pos_y = y;
    node.pos_w = w;
    node.pos_h = h;

    squarify_recurse(node, x, y, w, h, node.value || 0);
}

function squarify_recurse(node: FileNode, x: number, y: number, w: number, h: number, total:number) {

    if (!node.children) return;


    node.children = node.children.sort((f1, f2) => (f2.value || 0) - (f1.value || 0));

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

    let i = 0;
    while (i < node.children.length) {
        const child = node.children[i];
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
            // Aspect ration has become worse, start a new row
            finaliseRow(node.children, row_start, i, is_row, active_x, active_y, active_w, active_h, row_size, total);
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
    finaliseRow(node.children, row_start, i, is_row, active_x, active_y, active_w, active_h, row_size, total);

    for(const child of node.children) {
        squarify_recurse(child, 0, 0, child.pos_w, child.pos_h, child.value || 0);
    }
}