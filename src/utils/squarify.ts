// Taken from https://github.com/nicopolyptic

/*
     _   ___                        __            __  _
    / | / (_)________  ____  ____  / /_  ______  / /_(_)____
   /  |/ / / ___/ __ \/ __ \/ __ \/ / / / / __ \/ __/ / ___/
  / /|  / / /__/ /_/ / /_/ / /_/ / / /_/ / /_/ / /_/ / /__
 /_/ |_/_/\___/\____/ .___/\____/_/\__, / .___/\__/_/\___/
                   /_/            /____/_/
 */
/*export default function squarify(
    children: Node[],
    width: number,
    height: number,
) {
    var children: Node[] = children.slice(0);
    scaleWeights(children, width, height);
    children.sort((a: Node, b: Node) => { return b.value - a.value });
    // children.push(new InternalNode(0, null)); // ???
    var vertical = height < width;
    var w = vertical ? height : width;
    var x = 0, y = 0;
    var rw = width;
    var rh = height;
    var row: Node[] = [];
    while (children.length > 0) {
        var c = children[0];
        var r = c.value;
        var s = sum(row);
        var min = get_min(row);
        var max = get_max(row);
        var wit = worst(s + r, Math.min(min, r), Math.max(max, r), w);
        var without = worst(s, min, max, w);
        if (row.length === 0 || wit < without) {
            row.push(c);
            children.shift();
        } else {
            var rx = x;
            var ry = y;
            var z = s / w;
            var j;
            for (j = 0; j < row.length; ++j) {
                var d = row[j].value / z;
                if (vertical) {
                    setFrame(rx, ry, z, d, row[j]);
                    ry = ry + d;
                } else {
                    setFrame(rx, ry, d, z, row[j]);
                    rx = rx + d;
                }
            }
            if (vertical) {
                x = x + z;
                rw = rw - z;
            } else {
                y = y + z;
                rh = rh - z;
            }

            vertical = rh < rw;
            w = vertical ? rh : rw;
            row = [];
        }
    }
}

function setFrame(x:number, y:number, width:number, height:number, node:Node){
    node.frame = {
        x: x,
        y: y,
        width: width,
        height: height
    };
}*/

export function worst(s: number, min: number, max: number, w: number): number {
    return Math.max(w * w * max / (s * s), s * s / (w * w * min));
}

function scaleWeights(weights: Node[], width: number, height: number) {
    var scale = width * height / sum(weights);
    for (var i = 0; i < weights.length; i++) {
        weights[i].value = scale * weights[i].value;
    }
}

function get_max(array: Node[]): number {
    return Math.max.apply(Math, weights(array));
}

function get_min(array: Node[]): number {
    return Math.min.apply(Math, weights(array));
}

function sum(array: Node[]): number {
    var total = 0;
    for (let node of array) {
        total = total + node.value;
    }
    return total;
}

function weights(array: Node[]) {
    return array.map(d => d.value, array);
}


/*export default function squarify(
    rootNode: Node,
    f: (x: number, y: number, width: number, height: number, node: Node) => void
) {
    // InternalNode.weigh(rootNode);
    var children = new Array<Node>();
    children.push(rootNode);
    // level ordered traversal
    while (children.length > 0) {
        var node = children.shift();
        if (node.children && node.children.length > 0) {
            squarify_recurse(
                node.children,
                node.frame.width,
                node.frame.height,
            );

            for (var i = 0; i < node.children.length; ++i) {
                var childNode = node.children[i];
                if (childNode.children && childNode.children.length > 0) {
                    children.push(childNode);
                }
            }
        }
    }

    children.push(rootNode);
    while (children.length > 0) {
        var node2 = children.pop();
        f(node2.frame.x, node2.frame.y, node2.frame.width, node2.frame.height, node2);
        if (node2.children) {
            for (var i = 0; i < node2.children.length; ++i) {
                children.push(node2.children[i]);
            }
        }
    }
}*/

export interface Node {
    // parent : Node;
    children : Node[];
    // data: any;
    value: number;
    
    pos_x: number;
    pos_y: number;
    pos_w: number;
    pos_h: number;

    // level :number;
}