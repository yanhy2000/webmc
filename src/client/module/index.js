// Generated by CoffeeScript 2.5.1
var FPC, al, animate, camera, canvas, cursor, init, inv_bar, materials, parameters, playerObject, render, renderer, scene, socket, stats, worker, world;

scene = null;

materials = null;

parameters = null;

canvas = null;

renderer = null;

camera = null;

world = null;

cursor = null;

FPC = null;

socket = null;

stats = null;

worker = null;

playerObject = null;

inv_bar = null;

import * as THREE from './build/three.module.js';

import {
  SkeletonUtils
} from './jsm/utils/SkeletonUtils.js';

import Stats from './jsm/libs/stats.module.js';

import {
  World
} from './World/World.js';

import {
  FirstPersonControls
} from './FirstPersonControls.js';

import {
  gpuInfo
} from './gpuInfo.js';

import {
  AssetLoader
} from './AssetLoader.js';

import {
  InventoryBar
} from './InventoryBar.js';

import {
  Players
} from './Players.js';

import {
  RandomNick
} from './RandomNick.js';

init = function() {
  var ambientLight, clouds, directionalLight, loader, players, skybox;
  //canvas,renderer,camera,lights
  canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({
    canvas,
    PixelRatio: window.devicePixelRatio
  });
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, 2, 0.1, 1000);
  camera.rotation.order = "YXZ";
  camera.position.set(26, 26, 26);
  //skybox
  loader = new THREE.TextureLoader();
  skybox = loader.load("assets/images/skybox.jpg", function() {
    var rt;
    rt = new THREE.WebGLCubeRenderTarget(skybox.image.height);
    rt.fromEquirectangularTexture(renderer, skybox);
    scene.background = rt;
  });
  //Lights
  ambientLight = new THREE.AmbientLight(0xcccccc);
  scene.add(ambientLight);
  directionalLight = new THREE.DirectionalLight(0x333333, 2);
  directionalLight.position.set(1, 1, 0.5).normalize();
  scene.add(directionalLight);
  console.warn(gpuInfo());
  //Clouds
  clouds = al.get("clouds");
  clouds.scale.x = 0.1;
  clouds.scale.y = 0.1;
  clouds.scale.z = 0.1;
  clouds.position.y = 170;
  scene.add(clouds);
  //setup world
  world = new World({
    toxelSize: 27,
    cellSize: 16,
    scene,
    camera,
    al
  });
  //Socket.io setup
  socket = io.connect(`${al.get("host")}:${al.get("websocket-port")}`);
  socket.on("connect", function() {
    var nick;
    console.log("Połączono z serverem!");
    $('.loadingText').text("Wczytywanie terenu...");
    nick = document.location.hash.substring(1, document.location.hash.length);
    if (nick === "") {
      nick = RandomNick();
      document.location.href = `\#${nick}`;
    }
    console.log(`User nick: 	${nick}`);
    socket.emit("initClient", {
      nick: nick
    });
  });
  socket.on("blockUpdate", function(block) {
    world.setBlock(...block);
  });
  socket.on("mapChunk", function(sections, x, z) {
    return world._computeSections(sections, x, z);
  });
  players = new Players({socket, scene, al});
  socket.on("playerUpdate", function(data) {
    players.update(data);
  });
  socket.on("firstLoad", function(v) {
    console.log("First Load packet recieved!");
    world.replaceWorld(v);
    $(".initLoading").css("display", "none");
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  });
  //Inventory Bar
  inv_bar = new InventoryBar({
    boxSize: 60,
    padding: 4,
    div: ".inventoryBar"
  }).setBoxes(["assets/images/grass_block.png", "assets/images/stone.png", "assets/images/oak_planks.png", "assets/images/smoker.gif", "assets/images/anvil.png", "assets/images/brick.png", "assets/images/furnace.png", "assets/images/bookshelf.png", "assets/images/tnt.png"]).setFocusOnly(1).listen();
  //First Person Controls
  FPC = new FirstPersonControls({
    canvas,
    camera,
    micromove: 0.3
  });
  //Raycast cursor
  cursor = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 0.5
  }));
  scene.add(cursor);
  //jquery events
  $(document).mousedown(function(e) {
    var pos, rayBlock, voxelId;
    if (FPC.gameState === "game") {
      rayBlock = world.getRayBlock();
      if (rayBlock) {
        if (e.which === 1) {
          voxelId = 0;
          pos = rayBlock.posBreak;
        } else {
          voxelId = inv_bar.activeBox;
          pos = rayBlock.posPlace;
        }
        pos[0] = Math.floor(pos[0]);
        pos[1] = Math.floor(pos[1]);
        pos[2] = Math.floor(pos[2]);
        socket.emit("blockUpdate", [...pos, voxelId]);
      }
    }
  });
  animate();
};

render = function() {
  var height, pos, rayBlock, width;
  //Autoresize canvas
  width = window.innerWidth;
  height = window.innerHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  //Player movement
  if (FPC.gameState === "game") {
    socket.emit("playerUpdate", {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      xyaw: -camera.rotation.x,
      zyaw: camera.rotation.y + Math.PI
    });
    FPC.camMicroMove();
  }
  //Update cursor
  rayBlock = world.getRayBlock();
  if (rayBlock) {
    pos = rayBlock.posBreak;
    pos[0] = Math.floor(pos[0]);
    pos[1] = Math.floor(pos[1]);
    pos[2] = Math.floor(pos[2]);
    cursor.position.set(...pos);
    cursor.visible = true;
  } else {
    cursor.visible = false;
  }
  //Rendering
  world.updateCells();
  renderer.render(scene, camera);
};

animate = function() {
  try {
    stats.begin();
    render();
    stats.end();
  } catch (error) {}
  requestAnimationFrame(animate);
};

al = new AssetLoader();

$.get("assets/assetLoader.json", function(assets) {
  al.load(assets, function() {
    console.log("AssetLoader: done loading!");
    al.get("anvil").children[0].geometry.rotateX(-Math.PI / 2);
    al.get("anvil").children[0].geometry.translate(0, 0.17, 0);
    al.get("anvil").children[0].geometry.translate(0, -0.25, 0);
    init();
  }, al);
});
