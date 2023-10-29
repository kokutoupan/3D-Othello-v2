import { MyVec2 } from "./MyVec";
import { mat4 } from "gl-matrix";
import { OthelloStone } from "./OthelloStone";

export class Othello {
  private lineNum: number;

  private othelloStone: OthelloStone;

  constructor(program: WebGLProgram, gl: WebGL2RenderingContext) {
    this.lineNum = 8;
    this.stones = this.#createStones();
    this.othelloStone = new OthelloStone(program, gl);
  }

  private stones: Int8Array;

  SelectPos = new MyVec2(3, 3);
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


  getStone(pos: MyVec2) {
    return this.stones[this.lineNum * pos.y + pos.x];
  }

  getReverseStone(stone: number) {
    if (stone === 1) {
      return 2;
    } else if (stone === 2) {
      return 1;
    } else {
      return -1;
    }
  }

  setStone(pos: MyVec2, type: number) {
    this.stones[this.lineNum * pos.y + pos.x] = type;
  }

  selectSquare(keyCode: string) {
    let tmp = new MyVec2(this.SelectPos.x, this.SelectPos.y);
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
      this.SelectPos = tmp;
    }

    if (keyCode === "Enter") {
      if (this.getStone(this.SelectPos) === 0) {
        const OverTurnData = this.checkOverTurn(this.SelectPos, this.turn);
        console.log(OverTurnData);
        if (OverTurnData.num != 0) {
          this.setStone(this.SelectPos, this.turn);
          this.#changeStones(
            OverTurnData.lineStones,
            this.SelectPos,
            this.turn
          );
          this.#changeTurn();
        }
      }
    }

    //console.log(this.SelectPos);
  }

  rotation = 0;
  drawStone(modelLocation: WebGLUniformLocation, deltaTime: number) {
    this.othelloStone.setData();
    let modelMat = mat4.create();
    let distance = 45;
    let offset = [
      (distance * (this.lineNum - 1)) / 2,
      (distance * (this.lineNum - 1)) / 2,
    ];

    this.stones.forEach((data, index) => {
      let up = 0;
      if (
        this.SelectPos.x === index % this.lineNum &&
        this.SelectPos.y === Math.floor(index / this.lineNum)
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
          this.othelloStone.drawStone(modelLocation, modelMat);
          return;
        }
      }

      if (data === 1 || data === 2) {
        mat4.fromRotationTranslation(
          modelMat,
          [2 - data, 0, 0, 0],
          [
            distance * (index % this.lineNum) - offset[0],
            up,
            distance * Math.floor(index / this.lineNum) - offset[1],
          ]
        );
        this.othelloStone.drawStone(modelLocation, modelMat);
      }
      else if (data === 3) {
        this.rotation += ((0.8 * Math.PI) / 180) * deltaTime;
        mat4.fromTranslation(modelMat, [
          distance * (index % this.lineNum) - offset[0],
          0,
          distance * Math.floor(index / this.lineNum) - offset[1],
        ]);
        mat4.rotateX(modelMat, modelMat, this.rotation);
        //console.log(rotation);
        this.othelloStone.drawStone(modelLocation, modelMat);
      }
    });

    this.othelloStone.flush();
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

  #changeStones(lineStones: Array<[MyVec2, number]>, startPos: MyVec2, mStone: number) {
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

  checkOverTurn(startPos: MyVec2, mStone: number) {
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

    let lineStones = new Array<[MyVec2, number]>();

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

  #createStones() {
    const stones =  new Int8Array(this.lineNum * this.lineNum).fill(0);
    stones[this.lineNum * 3 + 3] = 1;
    stones[this.lineNum * 3 + 4] = 2;
    stones[this.lineNum * 4 + 3] = 2;
    stones[this.lineNum * 4 + 4] = 1;
    return stones;
  }
}