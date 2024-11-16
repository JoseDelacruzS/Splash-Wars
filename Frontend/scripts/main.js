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

// Lista para almacenar jugadores en la escena
let otherPlayers = {};

// Configurar listeners de sockets
function setupSocketListeners() {
    socket.on('connect', () => {
        console.log('Conectado al servidor con ID:', socket.id);
    });

    // Recibir lista de jugadores
    socket.on('playersList', (players) => {
        console.log('Lista actualizada de jugadores:', players);

        // Agregar o actualizar modelos de jugadores
        players.forEach((player) => {
            if (player.id !== socket.id && !otherPlayers[player.id]) {
                // Crear un modelo para el nuevo jugador
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const playerModel = new THREE.Mesh(geometry, material);
                playerModel.position.set(player.position.x, player.position.y, player.position.z);
                gameScene.scene.add(playerModel);

                // Guardar referencia
                otherPlayers[player.id] = playerModel;
            }
        });

        // Eliminar jugadores desconectados
        Object.keys(otherPlayers).forEach((id) => {
            if (!players.some((player) => player.id === id)) {
                gameScene.scene.remove(otherPlayers[id]);
                delete otherPlayers[id];
            }
        });
    });

    // Actualizar estados de otros jugadores
    socket.on('updatePlayers', (players) => {
        Object.values(players).forEach((player) => {
            if (otherPlayers[player.id]) {
                otherPlayers[player.id].position.set(player.position.x, player.position.y, player.position.z);
                otherPlayers[player.id].rotation.y = player.rotation.y;
            }
        });
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
