import * as THREE from 'three';
import GameScene from './scene.js';
import { HUD } from './hud.js';

let gameScene, hud;
let playerLife = 100;
let timeLeft = 120; // 2 minutos
let ammo = 15;

function init() {
    gameScene = new GameScene();
    hud = new HUD();

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function updateHUD() {
    hud.updateLife(playerLife);
    hud.updateTimer(timeLeft);
    hud.updateAmmo(ammo);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    gameScene.render();
    updateHUD();
}

function update() {
    // Lógica de actualización del juego
}

function onWindowResize() {
    gameScene.onWindowResize();
}

document.addEventListener('DOMContentLoaded', init);