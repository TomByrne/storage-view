import { Application, Graphics, InteractionEvent, LINE_CAP, LINE_JOIN, Rectangle, Sprite, Texture } from 'pixi.js'
import { FileNode, FileNodeTheme } from '../../store/jobsSlice/types';
import squarify from '../../utils/squarify';
import { defaultTheme } from '../../utils/themes';



const smallest_area = 2; // Files below this size will not be displayed

function createGradientTexture(colors: string[], w = 100, h = 100): Texture {
    const canvas = document.createElement("canvas");
    var ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = w;
    canvas.height = h;

    const hyp = Math.sqrt(w * w + h * h);

    // Create gradient
    var grd = ctx.createRadialGradient(0, 0, 0, 0, 0, hyp);
    for (var i = 0; i < colors.length; i++) {
        grd.addColorStop(i, colors[i]);
    }

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    return Texture.from(canvas);
}



const max_size = 4096;
const gradient_cache: Record<string, Texture> = {};

export class TreeMapGraph {
    app: Application;
    drawTimer: undefined | NodeJS.Timeout;
    root: undefined | FileNode;
    nodeMap: Record<string, Sprite> = {};
    highlit: string[] = [];


    container:Sprite = new Sprite();
    outlines:Graphics = new Graphics();
    rects:Record<string, Rectangle> = {};

    onClick: ((path:string, add:boolean) => void) | undefined;

    constructor() {
        this.app = new Application({
            resolution: window.devicePixelRatio || 1,
            transparent: false,
            backgroundColor: 0x111,
            width: 640,
            height: 480,
            // clearBeforeRender: false,
        });
        this.app.stage.addChild(this.container);
        this.app.stage.addChild(this.outlines);
    }

    get elem(): HTMLCanvasElement {
        return this.app.view;
    }

    setStageSize(w: number, h: number) {
        w = Math.min(max_size, Math.floor(w));
        h = Math.min(max_size, Math.floor(h));
        const rend = this.app.renderer;
        if (rend.width === w && rend.height === h) return;
        rend.resize(w, h);
        this.drawSoon();
    }

    setRoot(root: FileNode) {
        if (this.root === root) return;
        this.root = root;
        this.draw();
    }

    setHighlit(paths: string[]) {
        this.highlit = paths;

        for(const id in this.nodeMap) {
            this.checkHighlit(id, this.nodeMap[id]);
        }

        this.outlines.clear();
        for(const path of paths) {
            if(!this.nodeMap[path]) this.drawOutline(path);
        }
    }

    drawSoon() {
        if (this.drawTimer !== undefined) return;
        this.drawTimer = setTimeout(() => {
            this.drawTimer = undefined;
            this.draw();
        }, 1000);
    }

    draw() {
        if (this.drawTimer !== undefined) {
            clearTimeout(this.drawTimer);
            this.drawTimer = undefined;
        }
        // clear canvas
        if (this.root) {
            for(const path in this.nodeMap) {
                this.nodeMap[path].off("click");
            }
            this.rects = {};
            this.nodeMap = {};
            this.container.removeChildren();
            this.outlines.clear();
            squarify(this.root, this.app.renderer.width, this.app.renderer.height, (n, x, y, w, h) => this.commitSize(n, x, y, w, h));
        }
    }

    getTexture(theme: FileNodeTheme | undefined): Texture {
        theme = theme || defaultTheme;
        let texture = gradient_cache[theme.id];
        if (texture) return texture;

        texture = createGradientTexture(theme.colors);
        gradient_cache[theme.id] = texture;
        return texture;
    }

    commitSize(node: FileNode, x: number, y: number, w: number, h: number): boolean {
        this.rects[node.path] = new Rectangle(x, y, w, h);

        const too_small = Math.sqrt(w * w + h * h) < smallest_area;
        if (node.info?.is_dir === false || too_small) {
            console.log("commitSize: ", x, y, w, h, node);
            const rect = new Sprite(this.getTexture(node.theme));
            rect.x = x;
            rect.y = y;
            rect.width = w;
            rect.height = h;
            rect.interactive = true;
            this.container.addChild(rect);

            this.nodeMap[node.path] = rect;
            this.checkHighlit(node.path, rect);

            rect.on("click", (e:InteractionEvent) => {
                if(this.onClick) this.onClick(node.path, e.data.originalEvent.ctrlKey);
            })
        } else if(this.highlit.includes(node.path)) {
            this.drawOutline(node.path);
        }
        return !too_small;
    }

    checkHighlit(path: string, node: Sprite) {
        node.alpha = this.highlit.includes(path) ? 1 : 0.5;
    }

    drawOutline(path: string) {
        const rect = this.rects[path];
        if(!rect) return;
        this.outlines.lineStyle({
            color: 0xffffff,
            width: 3,
            alignment: 0,
            native: false,
            cap: LINE_CAP.SQUARE,
            join: LINE_JOIN.MITER,
            miterLimit: 10,
        });
        this.outlines.drawRect(rect.x, rect.y, rect.width, rect.height);
    }

    destroy() {
        this.app.destroy(true);
    }
}