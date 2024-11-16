import * as THREE from 'three';
import GameScene from './scene.js';
import { HUD } from './hud.js';

let gameScene, hud;
let playerLife = 100;
let timeLeft = 120; // 2 minutos
let ammo = 15;

const socket = io('https://splash-wars-game-a9d5d91bfbd6.herokuapp.com');

function generateRandomName() {
    const names = ['Player', 'Warrior', 'Hunter', 'Ninja', 'Ghost', 'Falcon', 'Viper', 'Phoenix', 'Shadow'];
    const randomNumber = Math.floor(Math.random() * names.length);
    return names[randomNumber] + Math.floor(Math.random() * 1000);
}

function joinRandomRoom() {
    const roomId = 'room1';
    const playerName = generateRandomName();
    socket.emit('joinRoom', roomId, playerName);
}

function init() {
    gameScene = new GameScene();
    hud = new HUD();
    joinRandomRoom();
    setupSocketListeners();
    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function setupSocketListeners() {
    socket.on('connect', () => {
        console.log('Conectado al servidor con ID:', socket.id);
    });

    socket.on('gameStarted', () => {
        console.log('El juego ha comenzado');
    });

    socket.on('healthUpdated', (newHealth) => {
        if (playerLife !== newHealth) {
            playerLife = newHealth;
            hud.updateLife(playerLife);
        }
    });

    socket.on('ammoReloaded', () => {
        ammo = 15;
        hud.updateAmmo(ammo);
    });

    socket.on('timeUpdated', (newTimeLeft) => {
        if (timeLeft !== newTimeLeft) {
            timeLeft = newTimeLeft;
            hud.updateTimer(timeLeft);
        }
    });

    socket.on('playerKilled', () => {
        console.log('Has sido eliminado');
    });

    socket.on('message', (message) => {
        console.log(message);
    });

    socket.on('playersList', (players) => {
        console.log('Jugadores en la sala:', players);
    });

    socket.on('playerJoined', ({ id, position }) => {
        if (id !== socket.id && position && 'x' in position && 'y' in position && 'z' in position) {
            gameScene.addPlayer(id, position);
        }
    });

    socket.on('updatePlayerPosition', ({ id, position }) => {
        if (id !== socket.id && position && 'x' in position && 'y' in position && 'z' in position) {
            gameScene.updatePlayerPosition(id, position);
        }
    });

    socket.on('playerLeft', (id) => {
        gameScene.removePlayer(id);
        console.log(`Jugador ${id} ha salido de la sala.`);
    });

    socket.on('disconnect', () => {
        console.error('Desconectado del servidor.');
    });
}

let lastPosition = { x: 0, y: 0, z: 0 };

function update() {
    if (gameScene.player) {
        const currentPosition = gameScene.player.model.position;
        if (Math.abs(currentPosition.x - lastPosition.x) > 0.1 ||
            Math.abs(currentPosition.y - lastPosition.y) > 0.1 ||
            Math.abs(currentPosition.z - lastPosition.z) > 0.1) {
            lastPosition = { ...currentPosition };
            socket.emit('updatePosition', currentPosition);
        }
    }
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

function onWindowResize() {
    gameScene.onWindowResize();
}

document.addEventListener('DOMContentLoaded', init);