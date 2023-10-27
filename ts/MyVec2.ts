export class MyVec2 {
  public x:number;
  public y:number;

  constructor(_x:number, _y:number) {
    this.x = _x;
    this.y = _y;
  }

  add(_pos:MyVec2) {
    this.x += _pos.x;
    this.y += _pos.y;
    return this;
  }
}
