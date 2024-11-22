// Importar módulos y clases necesarias
import * as THREE from 'three';
import GameScene from './scene.js';
import { HUD } from './hud.js';
import { Collectibles } from './collectibles.js';


// Variables de la escena
let gameScene, hud;
let playerLife = 100;
let timeLeft = 120; // 2 minutos
let ammo = 15;

// Conectar al servidor de Socket.IO
const socket = io('http://localhost:3000'); // Cambia el puerto si es necesario

// Inicialización
function init() {
    // Crear escena y HUD
    gameScene = new GameScene();
    hud = new HUD();

    // Escuchar eventos del servidor
    setupSocketListeners();

    // Eventos y render loop
    window.addEventListener('resize', onWindowResize, false);
    animate();
}

// Función para configurar los listeners de Socket.IO
function setupSocketListeners() {
    // Confirmar conexión
    socket.on('connect', () => {
        console.log('Conectado al servidor con ID:', socket.id);
    });

    // Evento de inicio del juego
    socket.on('gameStarted', () => {
        console.log('El juego ha comenzado');
        // Opcional: Iniciar lógica específica del juego
    });

    // Actualización de la vida del jugador
    socket.on('healthUpdated', (newHealth) => {
        playerLife = newHealth;
        hud.updateLife(playerLife);
    });

    // Evento de munición recargada
    socket.on('ammoReloaded', () => {
        ammo = 15; // Restablece la munición
        hud.updateAmmo(ammo);
    });

    // Evento de tiempo restante
    socket.on('timeUpdated', (newTimeLeft) => {
        timeLeft = newTimeLeft;
        hud.updateTimer(timeLeft);
    });

    // Evento de eliminación del jugador
    socket.on('playerKilled', () => {
        console.log('Has sido eliminado');
        // Lógica para terminar el juego o mostrar pantalla de "game over"
    });
}

// Actualizar HUD
function updateHUD() {
    hud.updateLife(playerLife);
    hud.updateTimer(timeLeft);
    hud.updateAmmo(ammo);
}

// Ciclo de animación
function animate() {
    requestAnimationFrame(animate);
    update();
    gameScene.render();
    updateHUD();
}

// Función de actualización del juego (Lógica adicional aquí)
function update() {
    // Emitir el estado actual si es necesario (como posición o eventos de disparo)
    socket.emit('updatePlayerState', { life: playerLife, ammo, timeLeft });
}

// Ajustar tamaño de la ventana
function onWindowResize() {
    gameScene.onWindowResize();
}

// Ejecutar init cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', init);
