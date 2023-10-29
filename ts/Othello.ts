import { MyVec2 } from "./MyVec2";
import { createBuffer } from "./index";
import { mat4 } from "gl-matrix";

export class Othello {
  private lineNum: number;
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
    this.lineNum = Math.sqrt(this.stones.length);
    this.gl = gl;
    this.vertexAttribLocation = gl.getAttribLocation(program, 'vertexPosition');
    this.colorAttribLocation = gl.getAttribLocation(program, 'color');



    // this.#setBoard(program);
    const stoneData = this.createStone();
    const vertices = stoneData.v;
    const indices = stoneData.i;
    this.StonesIndexSize = indices.length;

    this.stonesVertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, vertices);
    this.stonesIndexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indices);
    // this.#init(program,gl);
  }

  stones = [
    //1黒,2白
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];

  nowSquare = new MyVec2(3, 3);
  turn = 1;

  keyDirection = {
    KeyA: new MyVec2(-1, 0),
    KeyD: new MyVec2(1, 0),
    KeyW: new MyVec2(0, -1),
    KeyS: new MyVec2(0, 1)
  }

  #isOver(pos: MyVec2) {
    //console.log(pos);
    if (pos.x < 0) {
      return true;
    }
    if (pos.y < 0) {
      return true;
    }
    if (pos.x >= this.lineNum) {
      return true;
    }
    if (pos.y >= this.lineNum) {
      return true;
    }

    return false;
  }

  // #setBoard(program: WebGLProgram) {
  //   const vertices = new Float32Array([
  //     -180.0, -5.0, -180.0,  // 座標
  //     0.0, 1.0, 0.0, 1.0,      // 色
  //     -180.0, -5.0, 180.0,
  //     1.0, 0.0, 0.0, 1.0,
  //     180.0, -5.0, -180.0,
  //     1.0, 0.0, 0.0, 1.0,
  //     180.0, -5.0, 180.0,
  //     0.0, 0.0, 1.0, 1.0
  //   ]);
  //   const indices = new Uint16Array([0, 1, 2, 1, 3, 2]);

  //   return {0:createBuffer(this.gl,this.gl.ARRAY_BUFFER, vertices),1: createBuffer(this.gl,this.gl.ELEMENT_ARRAY_BUFFER, indices),2: indices.length}
  //   // this.boardVertexBuffer = createBuffer(this.gl,this.gl.ARRAY_BUFFER, vertices);
  //   // this.boardIndexBuffer = createBuffer(this.gl,this.gl.ELEMENT_ARRAY_BUFFER, indices);
  //   // this.boardIndexSize = indices.length;
  // }

  getStone(pos: MyVec2) {
    return this.stones[this.lineNum * pos.y + pos.x];
  }

  getReverseStone(stone:number) {
    if (stone === 1) {
      return 2;
    } else if (stone === 2) {
      return 1;
    } else {
      return -1;
    }
  }

  setStone(pos:MyVec2, type:number) {
    this.stones[this.lineNum * pos.y + pos.x] = type;
  }

  selectSquare(keyCode: string) {
    let tmp = new MyVec2(this.nowSquare.x, this.nowSquare.y);
    if (keyCode === "KeyA") {
      tmp.add(this.keyDirection.KeyA);
    }
    if (keyCode === "KeyD") {
      tmp.add(this.keyDirection.KeyD);
    }
    if (keyCode === "KeyW") {
      tmp.add(this.keyDirection.KeyW);
    }
    if (keyCode === "KeyS") {
      tmp.add(this.keyDirection.KeyS);
    }

    if (!this.#isOver(tmp)) {
      this.nowSquare = tmp;
    }

    if (keyCode === "Enter") {
      if (this.getStone(this.nowSquare) === 0) {
        const OverTurnData = this.checkOverTurn(this.nowSquare, this.turn);
        console.log(OverTurnData);
        if (OverTurnData.num != 0) {
          this.setStone(this.nowSquare, this.turn);
          this.#changeStones(
            OverTurnData.lineStones,
            this.nowSquare,
            this.turn
          );
          this.#changeTurn();
        }
      }
    }

    //console.log(this.nowSquare);
  }

  rotation = 0;
  drawStone(modelLocation:WebGLUniformLocation, deltaTime:number) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.stonesVertexBuffer);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.stonesIndexBuffer);

    this.gl.enableVertexAttribArray(this.vertexAttribLocation);
    this.gl.enableVertexAttribArray(this.colorAttribLocation);

    this.gl.vertexAttribPointer(this.vertexAttribLocation, this.VERTEX_SIZE, this.gl.FLOAT, false, this.STRIDE, this.POSITION_OFFSET);
    this.gl.vertexAttribPointer(this.colorAttribLocation, this.COLOR_SIZE, this.gl.FLOAT, false, this.STRIDE, this.COLOR_OFFSET);
    let modelMat = mat4.create();
    let distance = 45;
    let offset = [
      (distance * (this.lineNum - 1)) / 2,
      (distance * (this.lineNum - 1)) / 2,
    ];

    this.stones.forEach((data, index) => {
      let up = 0;
      if (
        this.nowSquare.x === index % this.lineNum &&
        this.nowSquare.y === Math.floor(index / this.lineNum)
      ) {
        up = 10;
        const isBlack = this.turn === 1 ? 1 : 0;
        if (data === 0) {
          mat4.fromRotationTranslation(
            modelMat,
            [isBlack, 0, 0, 0],
            [
              distance * (index % this.lineNum) - offset[0],
              up,
              distance * Math.floor(index / this.lineNum) - offset[1],
            ]
          );
          this.gl.uniformMatrix4fv(modelLocation, false, modelMat);

          this.gl.drawElements(this.gl.TRIANGLES, this.StonesIndexSize, this.gl.UNSIGNED_SHORT, 0);
        }
      }

      if (data === 1) {
        mat4.fromRotationTranslation(
          modelMat,
          [1, 0, 0, 0],
          [
            distance * (index % this.lineNum) - offset[0],
            up,
            distance * Math.floor(index / this.lineNum) - offset[1],
          ]
        );
        this.gl.uniformMatrix4fv(modelLocation, false, modelMat);

        this.gl.drawElements(this.gl.TRIANGLES, this.StonesIndexSize, this.gl.UNSIGNED_SHORT, 0);
      } else if (data === 2) {
        //console.log(index, '白');
        mat4.fromRotationTranslation(
          modelMat,
          [0, 0, 0, 0],
          [
            distance * (index % this.lineNum) - offset[0],
            up,
            distance * Math.floor(index / this.lineNum) - offset[1],
          ]
        );
        this.gl.uniformMatrix4fv(modelLocation, false, modelMat);

        this.gl.drawElements(this.gl.TRIANGLES, this.StonesIndexSize, this.gl.UNSIGNED_SHORT, 0);
      } else if (data === 3) {
        this.rotation += ((0.8 * Math.PI) / 180) * deltaTime;
        mat4.fromTranslation(modelMat, [
          distance * (index % this.lineNum) - offset[0],
          0,
          distance * Math.floor(index / this.lineNum) - offset[1],
        ]);
        mat4.rotateX(modelMat, modelMat, this.rotation);
        //console.log(rotation);
        this.gl.uniformMatrix4fv(modelLocation, false, modelMat);

        this.gl.drawElements(this.gl.TRIANGLES, this.StonesIndexSize, this.gl.UNSIGNED_SHORT, 0);
      }
    });

    // gl.bindBuffer(gl.ARRAY_BUFFER, this.boardVertexBuffer);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boardIndexBuffer);

    // gl.enableVertexAttribArray(this.vertexAttribLocation);
    // gl.enableVertexAttribArray(this.colorAttribLocation);

    // gl.vertexAttribPointer(this.vertexAttribLocation, this.VERTEX_SIZE, gl.FLOAT, false, this.STRIDE, this.POSITION_OFFSET);
    // gl.vertexAttribPointer(this.colorAttribLocation, this.COLOR_SIZE, gl.FLOAT, false, this.STRIDE, this.COLOR_OFFSET);

    // modelMat = mat4.create();
    // mat4.identity(modelMat)
    // gl.uniformMatrix4fv(modelLocation, false, modelMat);
    // gl.drawElements(gl.TRIANGLES, this.boardIndexSize, gl.UNSIGNED_SHORT, 0);
    this.gl.flush();

  }

  #changeTurn() {
    if (this.turn === 1) {
      this.turn = 2;
    } else {
      this.turn = 1;
    }

    let total = 0;
    for (let x = 0; x < this.lineNum; x++) {
      for (let y = 0; y < this.lineNum; y++) {
        if (this.getStone(new MyVec2(x, y)) === 0) {
          const OverTurnData = this.checkOverTurn(new MyVec2(x, y), this.turn);
          total += OverTurnData.num;
          if (total > 0) {
            console.log(total, OverTurnData);
            return;
          }
        }
      }
    }
    this.#changeTurn();
  }

  #changeStones(lineStones:Array<[MyVec2,number]>, startPos:MyVec2, mStone:number) {
    lineStones.forEach(([direction, num]) => {
      for (let i = 0; i < num; i++) {
        let tmp = new MyVec2(
          startPos.x + direction.x * (i + 1),
          startPos.y + direction.y * (i + 1)
        );
        this.setStone(tmp, mStone);
      }
    });
  }

  checkOverTurn(startPos:MyVec2, mStone:number) {
    let total = 0;

    const allDirection = [
      new MyVec2(-1, 0),
      new MyVec2(-1, 1),
      new MyVec2(0, 1),
      new MyVec2(1, 1),
      new MyVec2(1, 0),
      new MyVec2(1, -1),
      new MyVec2(0, -1),
      new MyVec2(-1, -1),
    ];

    let lineStones = new Array<[MyVec2,number]>();

    allDirection.forEach((direction) => {
      let num = 0;
      let flag = false;

      for (
        let pos = new MyVec2(
          startPos.x + direction.x,
          startPos.y + direction.y
        );
        !this.#isOver(pos);
        pos.add(direction)
      ) {
        let tmp = this.getStone(pos);

        if (this.getReverseStone(tmp) === mStone) {
          num++;
        } else if (tmp === mStone) {
          console.log("b");
          flag = true;
          break;
        } else {
          break;
        }
        console.log(pos);
      }

      total += flag ? num : 0;

      lineStones.push([direction, flag ? num : 0]);
    });

    return { num: total, lineStones: lineStones };
  }

  createStone() {
    var vertex = new Array(),
      idx = new Array();
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
}
