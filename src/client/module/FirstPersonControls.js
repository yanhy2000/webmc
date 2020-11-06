// Generated by CoffeeScript 2.5.1
var FirstPersonControls;

import * as THREE from './build/three.module.js';

FirstPersonControls = class FirstPersonControls {
  constructor(options) {
    this.kc = {
      "w": 87,
      "s": 83,
      "a": 65,
      "d": 68,
      "space": 32,
      "shift": 16
    };
    this.keys = {};
    this.canvas = options.canvas;
    this.camera = options.camera;
    this.micromove = options.micromove;
    this.gameState = "menu";
    this.listen();
  }

  ac(qx, qy, qa, qf) {
    var m_x, m_y, r_x, r_y;
    m_x = -Math.sin(qa) * qf;
    m_y = -Math.cos(qa) * qf;
    r_x = qx - m_x;
    r_y = qy - m_y;
    return {
      x: r_x,
      y: r_y
    };
  }

  camMicroMove() {
    if (this.keys[this.kc["w"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + THREE.MathUtils.degToRad(180), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + THREE.MathUtils.degToRad(180), this.micromove).y;
    }
    if (this.keys[this.kc["s"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y, this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y, this.micromove).y;
    }
    if (this.keys[this.kc["a"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y - THREE.MathUtils.degToRad(90), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y - THREE.MathUtils.degToRad(90), this.micromove).y;
    }
    if (this.keys[this.kc["d"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + THREE.MathUtils.degToRad(90), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + THREE.MathUtils.degToRad(90), this.micromove).y;
    }
    if (this.keys[this.kc["space"]]) {
      this.camera.position.y += this.micromove;
    }
    if (this.keys[this.kc["shift"]]) {
      return this.camera.position.y -= this.micromove;
    }
  }

  updatePosition(e) {
    if (this.gameState === "game") {
      this.camera.rotation.x -= THREE.MathUtils.degToRad(e.movementY / 10);
      this.camera.rotation.y -= THREE.MathUtils.degToRad(e.movementX / 10);
      if (THREE.MathUtils.radToDeg(this.camera.rotation.x) < -90) {
        this.camera.rotation.x = THREE.MathUtils.degToRad(-90);
      }
      if (THREE.MathUtils.radToDeg(this.camera.rotation.x) > 90) {
        this.camera.rotation.x = THREE.MathUtils.degToRad(90);
      }
    }
  }

  listen() {
    var _this, lockChangeAlert;
    _this = this;
    $(window).keydown(function(z) {
      _this.keys[z.keyCode] = true;
      //If click escape
      if (z.keyCode === 27) {
        if (_this.gameState === "menu") {
          _this.canvas.requestPointerLock();
        } else {
          document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
          document.exitPointerLock();
        }
      }
    });
    $(document).keyup(function(z) {
      delete _this.keys[z.keyCode];
    });
    $(".gameOn").click(function() {
      _this.canvas.requestPointerLock();
    });
    lockChangeAlert = function() {
      if (document.pointerLockElement === _this.canvas || document.mozPointerLockElement === _this.canvas) {
        _this.gameState = "game";
        $(".gameMenu").css("display", "none");
      } else {
        _this.gameState = "menu";
        $(".gameMenu").css("display", "block");
      }
    };
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    document.addEventListener("mousemove", function(e) {
      return _this.updatePosition(e);
    }, false);
    return this;
  }

};

export {
  FirstPersonControls
};
