// Importar módulos y clases necesarias
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'; // Asegúrate de importar FBXLoader
import GameScene from './scene.js';
import { HUD } from './hud.js';

// Variables de la escena
let gameScene, hud;
let playerLife = 100;
let timeLeft = 120; // 2 minutos
let ammo = 15;
let players = {}; // Objeto para almacenar los jugadores conectados

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
    });

    // Escuchar actualizaciones de posición de otros jugadores
    socket.on('playerPositionUpdated', (data) => {
        if (!players[data.id]) {
            // Si el jugador no existe, inicialízalo
            players[data.id] = { id: data.id, position: data.position, model: null };
        }
        // Actualizar la posición del jugador existente
        players[data.id].position = data.position;
        updatePlayerModel(data.id, data.position); // Llama a la función aquí
    });
}

// Función para crear el modelo del jugador
function createPlayerModel(callback) {
    const loader = new FBXLoader();
    loader.load('../assets/models/Player/source/little_boy_2.fbx', (object) => {
        object.scale.set(0.03, 0.03, 0.03);
        object.position.set(0, 1, 0);
        callback(object); // Llama al callback con el modelo cargado
    });
}

// Función para actualizar el modelo del jugador
function updatePlayerModel(playerId, position) {
    if (!players[playerId].model) {
        // Si no existe, crea el modelo del jugador
        createPlayerModel((playerModel) => {
            players[playerId].model = playerModel;
            gameScene.add(playerModel); // Agrega el modelo a la escena
            players[playerId].model.position.set(position.x, position.y, position.z); // Establece la posición inicial
        });
    } else {
        // Actualiza la posición del modelo
        players[playerId].model.position.set(position.x, position.y, position.z);
    }
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