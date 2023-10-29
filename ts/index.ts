import { mat4 } from "gl-matrix";
import { MyVec2,MyVec3 } from "./MyVec";
import { Othello } from "./Othello";
import { keySetup } from "./KeyEvents";

//shaderのソースコード
import fragment_shader from "../shader/fragment_shader.glsl";
import vertex_shader from "../shader/vertex_shader.glsl";

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 1920;
canvas.height = 1080;
canvas.style.marginTop = String(-540);
canvas.style.marginLeft = String(-960);
document.body.appendChild(canvas);
grateScreen();
const gl = canvas.getContext("webgl2");
if (gl == null) {
  alert("WebGL2 is not supported.");
  process.exit(1);
}

const infotmp = document.querySelector(".info");
if (infotmp == null) {
  console.log("info is null");
  process.exit(1);
}

const info = infotmp as HTMLElement;
info.innerHTML = "FPS:";

const keyDirectionsArray = [
  {
    KeyA: new MyVec2(-1, 0),
    KeyD: new MyVec2(1, 0),
    KeyW: new MyVec2(0, -1),
    KeyS: new MyVec2(0, 1),
  },
  {
    KeyA: new MyVec2(0, 1),
    KeyD: new MyVec2(0, -1),
    KeyW: new MyVec2(-1, 0),
    KeyS: new MyVec2(1, 0),
  },
  {
    KeyA: new MyVec2(1, 0),
    KeyD: new MyVec2(-1, 0),
    KeyW: new MyVec2(0, 1),
    KeyS: new MyVec2(0, -1),
  },
  {
    KeyA: new MyVec2(0, -1),
    KeyD: new MyVec2(0, 1),
    KeyW: new MyVec2(1, 0),
    KeyS: new MyVec2(-1, 0),
  },
];

//シェーダのソースからシェーダプログラムを生成し返す
function createShaderProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (vertexShader == null) {
    console.log("vertexShader is null");
    process.exit(1);
  }

  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);

  const vShaderCompileStatus = gl.getShaderParameter(
    vertexShader,
    gl.COMPILE_STATUS
  );
  if (!vShaderCompileStatus) {
    const info = gl.getShaderInfoLog(vertexShader);
    console.log(info);
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (fragmentShader == null) {
    console.log("fragmentShader is null");
    process.exit(1);
  }
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);

  const fShaderCompileStatus = gl.getShaderParameter(
    fragmentShader,
    gl.COMPILE_STATUS
  );
  if (!fShaderCompileStatus) {
    const info = gl.getShaderInfoLog(fragmentShader);
    console.log(info);
  }

  // シェーダプログラムを作成します。
  const program = gl.createProgram();
  if (program == null) {
    console.log("program is null");
    process.exit(1);
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linkStatus) {
    const info = gl.getProgramInfoLog(program);
    console.log(info);
  }

  // プログラムを使用します。
  gl.useProgram(program);

  return program;
}

export function createBuffer(
  gl: WebGL2RenderingContext,
  type: number,
  typedDataArray: Float32Array | Uint16Array
) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, typedDataArray, gl.STATIC_DRAW);
  gl.bindBuffer(type, null); // バインド解除

  if (buffer == null) {
    console.log("buffer is null");
    process.exit(1);
  }
  return buffer;
}
export const OnKeys = {
  left: false,
  right: false,
  up: false,
  down: false,
  ctrl: false,
  shift: false,
  keyK: false,
  keyJ: false,
  keyH: false,
  keyL: false,
};

keySetup();

const shaderSources = [vertex_shader, fragment_shader];

// プログラムの作成
//
const vertexShaderSource = shaderSources[0];
const fragmentShaderSource = shaderSources[1];

const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
export const othello = new Othello(program, gl);


//
// 設定の有効化
//
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);

//
// uniform変数の設定
//

// モデル変換行列
const model = mat4.create();
mat4.identity(model);

// プロジェクション変換行列。
const fovY = (60 * Math.PI) / 180;
const aspect = 1600 / 900;
const near = 30;
const far = 1600;
const projection = mat4.create();
mat4.perspective(projection, fovY, aspect, near, far);

const modelLocation = gl.getUniformLocation(program, "model");
const viewLocation = gl.getUniformLocation(program, "view");
const projectionLocation = gl.getUniformLocation(program, "projection");
//gl.uniformMatrix4fv(modelLocation, false, model);
gl.uniformMatrix4fv(projectionLocation, false, projection);

//
// loop用の変数たち
//

//gl.clearColor(0, 1.0, 0.5, 1.0);
gl.clearColor(0.015, 0.003, 0.196, 1.0);
let radius = 350;
let radian = 0;
let Xradian = Math.PI / 6;
let XZsurfacePosition = new MyVec2(0, 0);

//let rotation = 0;

// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

let beforeTime = 0;
function loop(timestamp: number) {
  const deltaTime = timestamp - beforeTime;
  beforeTime = timestamp;

  keyOperation(deltaTime);

  // ビュー変換行列を用意します。
  showDebug(deltaTime);

  const cameraPosition = Float32Array.of(
    Math.sin(radian) * radius * Math.cos(Xradian) + XZsurfacePosition.x,
    radius * Math.sin(Xradian),
    Math.cos(radian) * radius * Math.cos(Xradian) + XZsurfacePosition.y,
  );
  const lookAtPosition = Float32Array.of(XZsurfacePosition.x, 0, XZsurfacePosition.y);
  const upDirection = Float32Array.of(0, 1.0, 0);
  const view = mat4.create();
  mat4.lookAt(view, cameraPosition, lookAtPosition, upDirection);
  if (gl == null) {
    console.log("gl is null");
    process.exit(1);
  }
  gl.uniformMatrix4fv(viewLocation, false, view);

  // 前フレームの内容をクリアします。
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 描画します。
  // gl.drawElements(gl.TRIANGLES, indexSize, gl.UNSIGNED_SHORT, 0);
  if (modelLocation !== null) {
    othello.drawStone(modelLocation, deltaTime);

    gl.flush();
  }
  // 次フレームをリクエストします。
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);

function keyOperation(deltaTime: number) {
  if (OnKeys.keyL) {
    radian += (((1.5 * Math.PI) / 180) * deltaTime) / 10;
  }
  if (OnKeys.keyH) {
    radian -= (((1.5 * Math.PI) / 180) * deltaTime) / 10;
  }
  if (OnKeys.keyK) {
    Xradian += (((1.5 * Math.PI) / 180) * deltaTime) / 10;
  }
  if (OnKeys.keyJ) {
    Xradian -= (((1.5 * Math.PI) / 180) * deltaTime) / 10;
  }
  radian %= Math.PI * 2;
  if (Xradian > Math.PI / 2.0 - 0.01) {
    Xradian = Math.PI / 2.0 - 0.01;
  } else if (Xradian < Math.PI / -2.0 + 0.01) {
    Xradian = Math.PI / -2.0 + 0.01;
  }

  if (OnKeys.ctrl) {
    radius += deltaTime;
  }
  if (OnKeys.shift) {
    radius -= deltaTime;
  }
  if (radius < 100) {
    radius = 100;
  }
  if (radius > 1400) {
    radius = 1400;
  }

  if (OnKeys.up) {
    XZsurfacePosition.add(new MyVec2(0, -deltaTime));
  }
  if (OnKeys.down) {
    XZsurfacePosition.add(new MyVec2(0, deltaTime));
  }
  if (OnKeys.left) {
    XZsurfacePosition.add(new MyVec2(-deltaTime, 0));
  }
  if (OnKeys.right) {
    XZsurfacePosition.add(new MyVec2(deltaTime, 0));
  }

  if (XZsurfacePosition.x < -1000) {
    XZsurfacePosition.x = -1000;
  } else if (XZsurfacePosition.x > 1000) {
    XZsurfacePosition.x = 1000;
  }

  if (XZsurfacePosition.y < -1000) {
    XZsurfacePosition.y = -1000;
  } else if (XZsurfacePosition.y > 1000) {
    XZsurfacePosition.y = 1000;
  }

  if (
    Math.PI / 4 > Math.abs(radian) ||
    (Math.PI / 4) * 7 < Math.abs(radian)
  ) {
    othello.keyDirection = keyDirectionsArray[0];
  } else if (
    (Math.PI / 4 < radian && radian < (Math.PI / 4) * 3) ||
    ((-Math.PI / 4) * 7 < radian && radian < (-Math.PI / 4) * 5)
  ) {
    othello.keyDirection = keyDirectionsArray[1];
  } else if (
    ((Math.PI / 4) * 3 < radian && radian < (Math.PI / 4) * 5) ||
    ((-Math.PI / 4) * 5 < radian && radian < (-Math.PI / 4) * 3)
  ) {
    othello.keyDirection = keyDirectionsArray[2];
  } else if (
    ((Math.PI / 4) * 5 < radian && radian < (Math.PI / 4) * 7) ||
    ((-Math.PI / 4) * 3 < radian && radian < -Math.PI / 4)
  ) {
    othello.keyDirection = keyDirectionsArray[3];
  }
}

function showDebug(deltaTime: number) {
  info.innerHTML =
    " FPS: " +
    String(Math.round((1000 / deltaTime) * 100) / 100) +
    "\n" +
    " Position:\n  (" +
    Math.round(XZsurfacePosition.x * 100) / 100 +
    "," +
    Math.round(XZsurfacePosition.y * 100) / 100 +
    ")" +
    "\n" +
    " Rotate:\n" +
    "  X-Z:" +
    Math.round(radian * 100) / 100 +
    " X-Y:" +
    Math.round(Xradian * 100) / 100;
}

function grateScreen() {
  var styles = canvas.getAttribute("style") || "";
  var onResize = (canvas: HTMLCanvasElement) => {
    var scale = Math.min(
      window.innerWidth / canvas.width,
      window.innerHeight / canvas.height
    );
    var transform = "scale(" + scale + "," + scale + ");";

    canvas.setAttribute(
      "style",
      styles +
      "    -moz-transform: " +
      transform +
      "     -ms-transform: " +
      transform +
      "      -o-transform: " +
      transform +
      "         transform: " +
      transform +
      " -webkit-transform-origin: center center;" +
      "    -moz-transform-origin: center center;" +
      "     -ms-transform-origin: center center;" +
      "      -o-transform-origin: center center;" +
      "         transform-origin: center center;"
    );
  };

  onResize(canvas);
  window.addEventListener("resize", () => onResize(canvas), false);
}
