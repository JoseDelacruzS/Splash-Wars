// Importar módulos y clases necesarias
import * as THREE from 'three';
import GameScene from './scene.js';
import { HUD } from './hud.js';
import { Player } from './player.js';

// Variables de la escena
let gameScene, hud;
let playerLife = 100;
let timeLeft = 120; // 2 minutos
let ammo = 15;
let player;

// Conectar al servidor de Socket.IO
const socket = io('https://splash-wars-game-a9d5d91bfbd6.herokuapp.com');

// Función para generar nombres aleatorios
function generateRandomName() {
    const names = ['Player', 'Warrior', 'Hunter', 'Ninja', 'Ghost', 'Falcon', 'Viper', 'Phoenix', 'Shadow'];
    const randomNumber = Math.floor(Math.random() * names.length);
    return names[randomNumber] + Math.floor(Math.random() * 1000); // Para hacerlo más único
}

// Función para unirse a una sala con nombre aleatorio
function joinRandomRoom() {
    const roomId = 'room1';  // O puedes hacer que sea dinámico, por ejemplo, generar un ID de sala
    const playerName = generateRandomName();  // Genera un nombre aleatorio para el jugador
    socket.emit('joinRoom', roomId, playerName); // Emitir el evento de unirse a la sala con el nombre aleatorio
}

// Inicialización
function init() {
    // Crear escena y HUD
    gameScene = new GameScene();
    hud = new HUD();

    // Crear el jugador después de la inicialización de la escena
    player = new Player(gameScene.camera);

    // Unirse a la sala con nombre aleatorio
    joinRandomRoom();

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

    // Evento de mensaje general desde el servidor
    socket.on('message', (message) => {
        console.log(message);
    });

    // Actualización de la lista de jugadores
    socket.on('playersList', (players) => {
        console.log('Jugadores en la sala:', players);
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
    update();
    updateHUD();
    requestAnimationFrame(animate);
    const deltaTime = gameScene.clock.getDelta();

    player.update(deltaTime);
    gameScene.update();
    gameScene.render();
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
