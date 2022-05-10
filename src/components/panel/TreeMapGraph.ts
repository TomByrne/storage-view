import { Application, Sprite, Texture } from 'pixi.js'
import { FileNode, JobInfo } from '../../store/jobsSlice/jobsSlice';
import squarify from '../../utils/squarify2';


const canvas = document.createElement("canvas");

const smallest_area = 2; // Files below this size will not be displayed

function createGradientTexture(w = 100, h = 100):Texture {
    var ctx:CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = w;
    canvas.height = h;
    
    // Create gradient
    var grd = ctx.createLinearGradient(0, 0, w, 0);
    grd.addColorStop(0, "red");
    grd.addColorStop(1, "white");
    
    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    return Texture.from(canvas);
}

const gradient = createGradientTexture(400, 400);


const max_size = 4096;

export class TreeMapGraph {
    app: Application;
    drawTimer: undefined | NodeJS.Timeout;
    job:undefined | JobInfo;

    constructor(){
        this.app = new Application({
            resolution: window.devicePixelRatio || 1,
            transparent: false,
            backgroundColor: 0x111,
            width: 640,
            height: 480,
            // clearBeforeRender: false,
        });
    }

    get elem(): HTMLCanvasElement {
        return this.app.view;
    }
    
    setStageSize(w:number, h:number) {
        w = Math.min(max_size, Math.floor(w));
        h = Math.min(max_size, Math.floor(h));
        const rend = this.app.renderer;
        if(rend.width === w && rend.height === h) return;
        rend.resize(w, h);
        this.drawSoon();
    }

    setJob(job:JobInfo) {
        this.job = job;
        this.draw();
    }

    drawSoon() {
        if(this.drawTimer !== undefined) return;
        this.drawTimer = setTimeout(() => {
            this.drawTimer = undefined;
            this.draw();
        }, 1000);
    }

    draw(){
        if(this.drawTimer !== undefined) {
            clearTimeout(this.drawTimer);
            this.drawTimer = undefined;
        }
        // clear canvas
        if(this.job) {
            this.app.stage.removeChildren();
            squarify(this.job.root, this.app.renderer.width, this.app.renderer.height, (n, x, y, w, h) => this.commitSize(n, x, y, w, h));
        }
    }

    commitSize(node:FileNode, x:number, y:number, w:number, h:number): boolean {
        const too_small = Math.sqrt(w*w + h*h) < smallest_area;
        if(node.info?.is_dir === false || too_small) {
            const rect = new Sprite(gradient);
            rect.x = x;
            rect.y = y;
            rect.width = w;
            rect.height = h;
            this.app.stage.addChild(rect);
        }
        return !too_small;
    }

    destroy(){
        this.app.destroy(true);
    }
}