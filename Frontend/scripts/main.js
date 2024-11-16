// Importar módulos y clases necesarias
import * as THREE from 'three';
import GameScene from './scene.js';
import { HUD } from './hud.js';

// Variables de la escena
let gameScene, hud;
let playerLife = 100;
let timeLeft = 120; // 2 minutos
let ammo = 15;
const activePlayers = {};

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
    // Evento de actualización de la lista de jugadores
    socket.on('playersList', (players) => {
        console.log('Jugadores en la sala:', players);
        updatePlayers(players); // Llama a la función para actualizar los jugadores en la escena
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

// Función para actualizar los jugadores en la escena
function updatePlayers(players) {
    players.forEach(playerData => {
        const { id, name, position } = playerData;

        // Si el jugador ya existe, actualiza su posición
        if (activePlayers[id]) {
            activePlayers[id].model.position.set(position.x, position.y, position.z);
        } else {
            // Si el jugador no existe, crea un nuevo modelo
            const newPlayer = new Player(gameScene.scene, gameScene.camera); // Asegúrate de que el constructor de Player acepte la posición
            newPlayer.model.position.set(position.x, position.y, position.z);
            activePlayers[id] = newPlayer; // Almacena el nuevo jugador
        }
    });
}

// Ejecutar init cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', init);
