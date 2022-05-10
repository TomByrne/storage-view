import { Application, Sprite, Texture } from 'pixi.js'
import { FileNode, FileNodeTheme, JobInfo } from '../../store/jobsSlice/types';
import squarify from '../../utils/squarify2';
import { defaultTheme } from '../../utils/themes';



const smallest_area = 2; // Files below this size will not be displayed

function createGradientTexture(colors:string[], w = 100, h = 100):Texture {
    const canvas = document.createElement("canvas");
    var ctx:CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = w;
    canvas.height = h;
    
    // Create gradient
    var grd = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
    for(var i=0; i<colors.length; i++) {
        grd.addColorStop(i, colors[i]);
    }
    
    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    return Texture.from(canvas);
}



const max_size = 4096;
const gradient_cache:Record<string, Texture> = {};

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

    getTexture(theme:FileNodeTheme | undefined): Texture {
        theme = theme || defaultTheme;
        let texture = gradient_cache[theme.id];
        if(texture) return texture;

        texture = createGradientTexture(theme.colors);
        gradient_cache[theme.id] = texture;
        return texture;
    }

    commitSize(node:FileNode, x:number, y:number, w:number, h:number): boolean {
        const too_small = Math.sqrt(w*w + h*h) < smallest_area;
        if(node.info?.is_dir === false || too_small) {
            const rect = new Sprite(this.getTexture(node.theme));
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