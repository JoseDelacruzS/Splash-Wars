// Importar módulos y clases necesarias
import * as THREE from 'three';
import GameScene from './scene.js';
import { HUD } from './hud.js';

// Variables de la escena
let gameScene, hud;
let playerLife = 100;
let timeLeft = 120; // 2 minutos
let ammo = 15;

// Conectar al servidor de Socket.IO
const socket = io('https://splash-wars-game-a9d5d91bfbd6.herokuapp.com');

// Función para generar nombres aleatorios
function generateRandomName() {
    const names = ['Player', 'Warrior', 'Hunter', 'Ninja', 'Ghost', 'Falcon', 'Viper', 'Phoenix', 'Shadow'];
    const randomNumber = Math.floor(Math.random() * names.length);
    return `${names[randomNumber]}${Math.floor(Math.random() * 1000)}`; // Nombre único
}

// Función para unirse a una sala con nombre aleatorio
function joinRandomRoom() {
    const roomId = 'room1'; // Puedes hacerlo dinámico si lo necesitas
    const playerName = generateRandomName();
    socket.emit('joinRoom', roomId, playerName); // Emitir evento para unirse a la sala
}

// Inicialización
function init() {
    // Crear escena y HUD
    gameScene = new GameScene();
    hud = new HUD();

    // Validar inicialización
    if (!gameScene || !hud) {
        console.error('Error al inicializar la escena o el HUD');
        return;
    }

    // Unirse a la sala con nombre aleatorio
    joinRandomRoom();

    // Escuchar eventos del servidor
    setupSocketListeners();

    // Configurar eventos y comenzar el ciclo de animación
    window.addEventListener('resize', onWindowResize, false);
    animate();
}

// Configurar los listeners de Socket.IO
function setupSocketListeners() {
    // Confirmar conexión
    socket.on('connect', () => {
        console.log('Conectado al servidor con ID:', socket.id);
    });

    // Evento para un nuevo jugador
    socket.on('newPlayer', (playerData) => {
        if (gameScene) {
            console.log('Nuevo jugador conectado:', playerData);
            gameScene.addPlayer(playerData);
        }
    });

    // Lista inicial de jugadores
    socket.on('playersList', (players) => {
        console.log('Jugadores en la sala:', players);
        players.forEach(player => {
            if (player.id !== socket.id && gameScene) {
                gameScene.addPlayer(player);
            }
        });
    });

    // Actualización de la posición del jugador
    socket.on('playerPositionUpdated', ({ id, position }) => {
        if (gameScene) {
            const player = gameScene.getPlayerById(id);
            if (player) {
                player.updatePosition(position);
            }
        }
    });

    // Actualización de la vida del jugador
    socket.on('healthUpdated', (newHealth) => {
        playerLife = newHealth;
        if (hud) hud.updateLife(playerLife);
    });

    // Evento de munición recargada
    socket.on('ammoReloaded', () => {
        ammo = 15; // Restablecer munición
        if (hud) hud.updateAmmo(ammo);
    });

    // Evento de tiempo restante
    socket.on('timeUpdated', (newTimeLeft) => {
        timeLeft = newTimeLeft;
        if (hud) hud.updateTimer(timeLeft);
    });

    // Evento de eliminación del jugador
    socket.on('playerKilled', () => {
        console.log('Has sido eliminado');
        // Lógica para finalizar el juego o mostrar pantalla de "game over"
    });

    // Evento general del servidor
    socket.on('message', (message) => {
        console.log(message);
    });
}

// Actualizar HUD
function updateHUD() {
    if (hud) {
        hud.updateLife(playerLife);
        hud.updateTimer(timeLeft);
        hud.updateAmmo(ammo);
    }
}

// Ciclo de animación
function animate() {
    requestAnimationFrame(animate);
    update();
    if (gameScene) gameScene.render();
    updateHUD();
}

// Actualizar lógica del juego
function update() {
    if (gameScene && gameScene.player) {
        const position = {
            x: gameScene.player.model.position.x,
            y: gameScene.player.model.position.y,
            z: gameScene.player.model.position.z,
        };
        socket.emit('updatePlayerPosition', position); // Enviar posición al servidor
    }
}

// Ajustar tamaño de la ventana
function onWindowResize() {
    if (gameScene) gameScene.onWindowResize();
}

// Ejecutar init cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', init);
