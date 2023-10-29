import { OnKeys, othello } from "./index";

export function keySetup() {
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
}


function keyDown(event: KeyboardEvent) {
    // console.log(event);
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

function keyUp(event: KeyboardEvent) {
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
