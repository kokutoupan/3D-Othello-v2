import { MyVec3 } from "./MyVec";
import { mat4, vec3 } from "gl-matrix";
import { OthelloStone } from "./OthelloStone";

export class Othello {
  private lineNum: number;

  private othelloStone: OthelloStone;

  public SelectPos: MyVec3;

  public blackStoneNum = 4;
  public whiteStoneNum = 4;

  constructor(program: WebGLProgram, gl: WebGL2RenderingContext) {
    this.lineNum = 8;
    this.stones = this.#createStones();

    this.SelectPos = new MyVec3(this.lineNum / 2 - 1, this.lineNum / 2 - 1, this.lineNum / 2 - 1);
    this.othelloStone = new OthelloStone(program, gl);
  }

  private stones: Int8Array;

  turn = 1;

  keyDirection = {
    KeyA: new MyVec3(-1, 0, 0),
    KeyD: new MyVec3(1, 0, 0),
    KeyW: new MyVec3(0, -1, 0),
    KeyS: new MyVec3(0, 1, 0)
  }

  #isOver(pos: MyVec3) {
    //console.log(pos);
    if (pos.x < 0 || pos.y < 0 || pos.x >= this.lineNum || pos.y >= this.lineNum || pos.z < 0 || pos.z >= this.lineNum) {
      return true;
    }

    return false;
  }


  getStone(pos: MyVec3) {
    return this.stones[this.lineNum * this.lineNum * pos.z + this.lineNum * pos.y + pos.x];
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

  setStone(pos: MyVec3, type: number) {
    let tmp = this.getStone(pos);
    if(this.getReverseStone(tmp) === type){
      if(type === 1){
        this.blackStoneNum++;
        this.whiteStoneNum--;
      }else if(type === 2){
        this.blackStoneNum--;
        this.whiteStoneNum++;
      }
    }
    else if(tmp === 0){
      if(type === 1){
        this.blackStoneNum++;
      }else if(type === 2){
        this.whiteStoneNum++;
      }
    }
    this.stones[this.lineNum * this.lineNum * pos.z + this.lineNum * pos.y + pos.x] = type;
  }

  selectSquare(keyCode: string) {
    let tmp = new MyVec3(this.SelectPos.x, this.SelectPos.y, this.SelectPos.z);
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
    if (keyCode === "KeyE") {
      tmp.add(new MyVec3(0, 0, 1));
    }
    if (keyCode === "KeyQ") {
      tmp.add(new MyVec3(0, 0, -1));
    }

    if (!this.#isOver(tmp)) {
      this.SelectPos = tmp;
    }

    if (keyCode === "Enter") {
      if (this.getStone(this.SelectPos) === 0) {
        const OverTurnData = this.checkOverTurn(this.SelectPos, this.turn);
        // console.log(OverTurnData);
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
      let up = Math.floor(index / this.lineNum / this.lineNum) * 30 - 20;
      // let up = 0;
      let x = distance * (index % this.lineNum) - offset[0];
      let y = distance * Math.floor(index / this.lineNum % this.lineNum) - offset[1];
      if (
        this.SelectPos.x === index % this.lineNum &&
        this.SelectPos.y === Math.floor(index / this.lineNum % this.lineNum) &&
        this.SelectPos.z === Math.floor(index / this.lineNum / this.lineNum)
      ) {
        up += 10;
        const isBlack = this.turn === 1 ? 1 : 0;
        if (data === 0) {
          mat4.fromRotationTranslation(
            modelMat,
            [isBlack, 0, 0, 0],
            [x, up, y]
          );
          this.othelloStone.drawStone(modelLocation, modelMat);
          return;
        }
      }

      if (data === 1 || data === 2) {
        mat4.fromRotationTranslation(
          modelMat,
          [2 - data, 0, 0, 0],
          [x, up, y]
        );
        this.othelloStone.drawStone(modelLocation, modelMat);
      }
      else if (data === 3) {
        this.rotation += ((0.8 * Math.PI) / 180) * deltaTime;
        mat4.fromTranslation(modelMat, [x, up, y]);
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
        for (let z = 0; z < this.lineNum; z++) {
          if (this.getStone(new MyVec3(x, y, z)) === 0) {
            const OverTurnData = this.checkOverTurn(new MyVec3(x, y, z), this.turn);
            total += OverTurnData.num;
            if (total > 0) {
              // console.log(total, OverTurnData);
              return;
            }
          }
        }
      }
    }
    this.#changeTurn();
  }

  #changeStones(lineStones: Array<[MyVec3, number]>, startPos: MyVec3, mStone: number) {
    lineStones.forEach(([direction, num]) => {
      for (let i = 0; i < num; i++) {
        let tmp = new MyVec3(
          startPos.x + direction.x * (i + 1),
          startPos.y + direction.y * (i + 1)
          , startPos.z + direction.z * (i + 1));
        this.setStone(tmp, mStone);
      }
    });
  }

  checkOverTurn(startPos: MyVec3, mStone: number) {
    let total = 0;

    const allDirection = [
      new MyVec3(-1, 0, 0),
      new MyVec3(-1, 1, 0),
      new MyVec3(0, 1, 0),
      new MyVec3(1, 1, 0),
      new MyVec3(1, 0, 0),
      new MyVec3(1, -1, 0),
      new MyVec3(0, -1, 0),
      new MyVec3(-1, -1, 0),
    ];

    let lineStones = new Array<[MyVec3, number]>();
    for (let dz = -1; dz <= 1; dz++) {
      allDirection.forEach((direction) => {
        let num = 0;
        let flag = false;

        let dir = new MyVec3(direction.x, direction.y, dz);
        for (
          let pos = new MyVec3(
            startPos.x + dir.x,
            startPos.y + dir.y
            , startPos.z + dir.z);
          !this.#isOver(pos);
          pos.add(dir)
        ) {
          let tmp = this.getStone(pos);

          if (this.getReverseStone(tmp) === mStone) {
            num++;
          } else if (tmp === mStone) {
            flag = true;
            break;
          } else {
            break;
          }
          // console.log(num, pos, dir);
        }

        total += flag ? num : 0;

        lineStones.push([dir, flag ? num : 0]);
      });
    }
    {
      let num = 0;
      let flag = false;

      for (
        let pos = new MyVec3(
          startPos.x,
          startPos.y
          , startPos.z + 1);
        !this.#isOver(pos);
        pos.z++
      ) {
        let tmp = this.getStone(pos);

        if (this.getReverseStone(tmp) === mStone) {
          num++;
        } else if (tmp === mStone) {
          flag = true;
          break;
        } else {
          break;
        }
      }
      total += flag ? num : 0;

      lineStones.push([new MyVec3(0, 0, 1), flag ? num : 0]);
    }
    {
      let num = 0;
      let flag = false;

      for (
        let pos = new MyVec3(
          startPos.x,
          startPos.y
          , startPos.z - 1);
        !this.#isOver(pos);
        pos.z--
      ) {
        let tmp = this.getStone(pos);

        if (this.getReverseStone(tmp) === mStone) {
          num++;
        } else if (tmp === mStone) {
          flag = true;
          break;
        } else {
          break;
        }
      }

      total += flag ? num : 0;

      lineStones.push([new MyVec3(0, 0, -1), flag ? num : 0]);
    }



    return { num: total, lineStones: lineStones };
  }

  #createStones() {
    const stones = new Int8Array(this.lineNum * this.lineNum * this.lineNum).fill(0);
    stones[this.lineNum * this.lineNum * 3 + this.lineNum * 3 + 3] = 1;
    stones[this.lineNum * this.lineNum * 3 + this.lineNum * 3 + 4] = 2;
    stones[this.lineNum * this.lineNum * 3 + this.lineNum * 4 + 3] = 2;
    stones[this.lineNum * this.lineNum * 3 + this.lineNum * 4 + 4] = 1;

    stones[this.lineNum * this.lineNum * 4 + this.lineNum * 3 + 3] = 2;
    stones[this.lineNum * this.lineNum * 4 + this.lineNum * 3 + 4] = 1;
    stones[this.lineNum * this.lineNum * 4 + this.lineNum * 4 + 3] = 1;
    stones[this.lineNum * this.lineNum * 4 + this.lineNum * 4 + 4] = 2;
    // console.log(stones);
    return stones;
  }
}