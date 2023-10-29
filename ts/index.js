const PATH = "./src/";

//const canvas = document.getElementById('canvas');

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 1920;
canvas.height = 1080;
canvas.style.marginTop = -540;
canvas.style.marginLeft = -960;
document.body.appendChild(canvas);
grateScreen();
const gl = canvas.getContext("webgl2");

const mat4 = glMatrix.mat4;

const info = document.querySelector(".info");
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

function loadShaders() {
  const loadVertexShader = fetch(PATH + "vertex_shader.glsl").then((res) =>
    res.text()
  );
  const loadFragmentShader = fetch(PATH + "fragment_shader.glsl").then((res) =>
    res.text()
  );
  return Promise.all([loadVertexShader, loadFragmentShader]);
}

//シェーダのソースからシェーダプログラムを生成し返す
function createShaderProgram(vsSource, fsSource) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
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

function createBuffer(type, typedDataArray) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, typedDataArray, gl.STATIC_DRAW);
  gl.bindBuffer(type, null); // バインド解除

  return buffer;
}

// シェーダを読み込み終わったら開始します。
loadShaders().then((shaderSources) => {
  //
  // プログラムの作成
  //
  const vertexShaderSource = shaderSources[0];
  const fragmentShaderSource = shaderSources[1];

  const program = createShaderProgram(vertexShaderSource, fragmentShaderSource);
  const othello = new Othello(program);

  //   othello.init(program);
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  const OnKeys = {
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

  function keyDown(event) {
    console.log(event);
    othello.selectSquare(event.code);

    if (event.code === "ArrowLeft") {
      OnKeys.left = true;
    }
    if (event.code === "ArrowRight") {
      OnKeys.right = true;
    }
    if (event.code === "ArrowUp") {
      OnKeys.up = true;
    }
    if (event.code === "ArrowDown") {
      OnKeys.down = true;
    }
    if (event.code === "ControlLeft") {
      OnKeys.ctrl = true;
    }
    if (event.code === "ShiftLeft") {
      OnKeys.shift = true;
    }

    if (event.code === "KeyK") {
      OnKeys.keyK = true;
    }
    if (event.code === "KeyJ") {
      OnKeys.keyJ = true;
    }
    if (event.code === "KeyH") {
      OnKeys.keyH = true;
    }
    if (event.code === "KeyL") {
      OnKeys.keyL = true;
    }
  }

  function keyUp(event) {
    if (event.code === "ArrowLeft") {
      OnKeys.left = false;
    }
    if (event.code === "ArrowRight") {
      OnKeys.right = false;
    }
    if (event.code === "ArrowUp") {
      OnKeys.up = false;
    }
    if (event.code === "ArrowDown") {
      OnKeys.down = false;
    }
    if (event.code === "ControlLeft") {
      OnKeys.ctrl = false;
    }
    if (event.code === "ShiftLeft") {
      OnKeys.shift = false;
    }

    if (event.code === "KeyK") {
      OnKeys.keyK = false;
    }
    if (event.code === "KeyJ") {
      OnKeys.keyJ = false;
    }
    if (event.code === "KeyH") {
      OnKeys.keyH = false;
    }
    if (event.code === "KeyL") {
      OnKeys.keyL = false;
    }
  }

  //
  // 設定の有効化
  //
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  //
  // uniform変数の設定
  //

  // モデル変換行列。今回は特に何もしません。
  const model = mat4.create();
  mat4.identity(model);
  // mat4.fromYRotation(model,Math.PI/6);
  // console.log(model);

  // ビュー変換行列。
  // 今回はビュー変換行列を変化させ続けて
  // アニメーションを実現するので、ここでは飛ばします。

  // プロジェクション変換行列。
  // 今回はperspectiveメソッドを使用します。
  // これは視野角とアスペクト比、near、far、から
  // 視野錐台を作成してくれるものです。
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
  gl.clearColor(0.015, 0.003, 0.196, 1.000)
  let radius = 350;
  let radian = 0;
  let Xradian = Math.PI / 6;
  let XZsurfacePosition = new MyVec2(0, 0);

  //let rotation = 0;

  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  let beforeTime = 0;
  function loop(timestamp) {
    const deltaTime = timestamp - beforeTime;
    beforeTime = timestamp;

    keyOperation(deltaTime);

    // ビュー変換行列を用意します。
    showDebug(deltaTime);

    const cameraPosition = [
      Math.sin(radian) * radius * Math.cos(Xradian) + XZsurfacePosition.x,
      radius * Math.sin(Xradian),
      Math.cos(radian) * radius * Math.cos(Xradian) + XZsurfacePosition.y,
    ];
    const lookAtPosition = [XZsurfacePosition.x, 0, XZsurfacePosition.y];
    const upDirection = [0, 1.0, 0];
    const view = mat4.create();
    mat4.lookAt(view, cameraPosition, lookAtPosition, upDirection);
    gl.uniformMatrix4fv(viewLocation, false, view);

    // 前フレームの内容をクリアします。
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 描画します。
    // gl.drawElements(gl.TRIANGLES, indexSize, gl.UNSIGNED_SHORT, 0);

    othello.drawStone(modelLocation, deltaTime);

    gl.flush();

    // 次フレームをリクエストします。
    window.requestAnimationFrame(loop);
  }

  window.requestAnimationFrame(loop);

  function keyOperation(deltaTime) {
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
    // if (OnKeys.up) {
    //   XZsurfacePosition.add(new MyVec2(deltaTime*Math.sin(radian), -deltaTime*Math.cos(radian)));
    // }
    // if (OnKeys.down) {
    //   XZsurfacePosition.add(new MyVec2(-deltaTime*Math.sin(radian), deltaTime*Math.cos(radian)));
    // }
    // if (OnKeys.left) {
    //   XZsurfacePosition.add(new MyVec2(-deltaTime*Math.sin(radian+Math.PI/2), deltaTime*Math.cos(radian+Math.PI/2)));
    // }
    // if (OnKeys.right) {
    //   XZsurfacePosition.add(new MyVec2(deltaTime*Math.sin(radian+Math.PI/2), -deltaTime*Math.cos(radian+Math.PI/2)));
    // }

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

  function showDebug(deltaTime) {
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
});

function grateScreen() {
  var styles = canvas.getAttribute("style") || "";
  var onResize = (canvas) => {
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
