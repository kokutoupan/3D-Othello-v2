import { mat4 } from 'gl-matrix';
import { createBuffer } from './index';

export class OthelloStone {

    private gl: WebGL2RenderingContext;
    private vertexAttribLocation: number;
    private colorAttribLocation: number;

    private stonesVertexBuffer: WebGLBuffer;
    private stonesIndexBuffer: WebGLBuffer;
    private StonesIndexSize: number;

    private readonly VERTEX_SIZE = 3; // vec3
    private readonly COLOR_SIZE = 4; // vec4

    private readonly STRIDE = (3 + 4) * Float32Array.BYTES_PER_ELEMENT;
    private readonly POSITION_OFFSET = 0;
    private readonly COLOR_OFFSET = 3 * Float32Array.BYTES_PER_ELEMENT;


    constructor(program: WebGLProgram, gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.vertexAttribLocation = gl.getAttribLocation(program, 'vertexPosition');
        this.colorAttribLocation = gl.getAttribLocation(program, 'color');

        const stoneData = this.createStone();
        const vertices = stoneData.v;
        const indices = stoneData.i;
        this.StonesIndexSize = indices.length;

        this.stonesVertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, vertices);
        this.stonesIndexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indices);
    }
    createStone() {
        let vertex = new Array();
        let idx = new Array();
        const row = 254;
        const column = 254;
        const rad = 20.0;
        const heightRad = 5;

        for (let i = 0; i <= row; i++) {
            let r = (Math.PI / row) * i;
            let ry = Math.cos(r);
            let rr = 1 - ((i - row / 2) / (row / 2)) ** 6;
            //console.log(rr);
            let color;
            if (i < row / 2) {
                color = [1, 1, 1, 1];
            } else {
                color = [0, 0, 0, 1];
            }
            for (let ii = 0; ii <= column; ii++) {
                let tr = ((Math.PI * 2) / column) * ii;

                let nx = rr * Math.cos(tr);
                let ny = ry;
                let nz = rr * Math.sin(tr);

                let tx = nx * rad;
                let ty = ny * heightRad;
                let tz = nz * rad;

                //console.log(ty);
                vertex.push(tx, ty, tz);
                vertex.push(color[0], color[1], color[2], color[3]);
            }
        }
        let r = 0;
        for (let i = 0; i < row; i++) {
            for (let ii = 0; ii < column; ii++) {
                r = (column + 1) * i + ii;
                idx.push(r, r + 1, r + column + 2);
                idx.push(r, r + column + 2, r + column + 1);
            }
        }
        let vf = Float32Array.from(vertex);
        let idxf = Uint16Array.from(idx);
        return { v: vf, i: idxf };
    }

    setData() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.stonesVertexBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.stonesIndexBuffer);

        this.gl.enableVertexAttribArray(this.vertexAttribLocation);
        this.gl.enableVertexAttribArray(this.colorAttribLocation);

        this.gl.vertexAttribPointer(this.vertexAttribLocation, this.VERTEX_SIZE, this.gl.FLOAT, false, this.STRIDE, this.POSITION_OFFSET);
        this.gl.vertexAttribPointer(this.colorAttribLocation, this.COLOR_SIZE, this.gl.FLOAT, false, this.STRIDE, this.COLOR_OFFSET);
    }

    drawStone(modelLocation: WebGLUniformLocation, modelMat: mat4) {
        this.gl.uniformMatrix4fv(modelLocation, false, modelMat);

        this.gl.drawElements(this.gl.TRIANGLES, this.StonesIndexSize, this.gl.UNSIGNED_SHORT, 0);
        // console.log("draw");
    }

    flush(){
        this.gl.flush();
    }
};