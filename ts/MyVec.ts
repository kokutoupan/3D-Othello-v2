export class MyVec2 {
  public x: number;
  public y: number;

  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }

  add(_pos: MyVec2) {
    this.x += _pos.x;
    this.y += _pos.y;
    return this;
  }
}

export class MyVec3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(_x: number, _y: number, _z: number) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
  }

  add(_pos: MyVec3) {
    this.x += _pos.x;
    this.y += _pos.y;
    this.z += _pos.z;
    return this;
  }
}