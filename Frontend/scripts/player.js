import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { PlayerAnimations } from './playerAnimations.js';
const socket = io('https://splash-wars-game-a9d5d91bfbd6.herokuapp.com/');  // URL de tu servidor

export class Player {
    constructor(scene, camera, socket) {
        this.scene = scene;
        this.camera = camera;
        this.socket = socket; // Almacenar el socket para comunicación
        this.model = null;
        this.velocity = new THREE.Vector3();
        this.moveSpeed = 7;
        this.keys = { w: false, a: false, s: false, d: false, space: false };
        this.isJumping = false;
        this.velocityY = 10;
        this.gravity = -9.81;
        this.otherPlayers = {};  // Añadir esto al constructor de Player

        // Conectar el socket para recibir actualizaciones de otros jugadores
        this.socket.on('playerMoved', (data) => {
            this.updateOtherPlayerPosition(data.id, data.position);
        });

        this.loadModel();
        this.setupKeyboardControls();
        this.setupMouseControls();
    }

    // Actualizar la posición de otros jugadores
    updateOtherPlayerPosition(playerId, position) {
        // Verifica si ya existe un modelo para este jugador, si no lo crea
        if (!this.otherPlayers[playerId]) {
            this.otherPlayers[playerId] = new THREE.Object3D();  // Crear un objeto para el otro jugador
            this.scene.add(this.otherPlayers[playerId]);
        }

        // Actualiza la posición de ese jugador
        this.otherPlayers[playerId].position.set(position.x, position.y, position.z);
    }

    loadModel() {
        const loader = new FBXLoader();
        loader.load(
            '../assets/models/Player/source/little_boy_2.fbx',
            (object) => {
                this.model = object;
                this.model.scale.set(0.03, 0.03, 0.03);
                this.model.position.set(0, 1, 0);
                this.loadTexture();
                this.animations = new PlayerAnimations(this.model);
                this.loadAnimations();
                this.scene.add(this.model);
                this.updateCameraPosition();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.error('An error happened', error);
            }
        );
    }

    // Enviar la nueva posición al servidor
    sendPosition() {
        const position = this.model.position;
        this.socket.emit('updatePlayerPosition', { id: this.socket.id, position: position });
    }

    update(deltaTime) {
        if (!this.model) return;

        // Inicializamos la velocidad en 0
        this.velocity.set(0, 0, 0);

        // Movimiento básico
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(this.model.rotation.y);

        const forward = new THREE.Vector3(0, 0, 1);
        const right = new THREE.Vector3(-1, 0, 0);

        forward.applyMatrix4(rotationMatrix);
        right.applyMatrix4(rotationMatrix);

        if (this.keys.w) this.velocity.add(forward);
        if (this.keys.s) this.velocity.sub(forward);
        if (this.keys.a) this.velocity.sub(right);
        if (this.keys.d) this.velocity.add(right);

        if (this.velocity.length() > 0) {
            this.velocity.normalize().multiplyScalar(this.moveSpeed * deltaTime);
            this.model.position.add(this.velocity);
        }

        // Enviar la nueva posición al servidor
        this.sendPosition();

        // Manejo de salto
        if (this.isJumping) {
            this.velocityY += this.gravity * deltaTime;
            this.model.position.y += this.velocityY * deltaTime;

            if (this.model.position.y <= .5) {
                this.model.position.y = 1;
                this.isJumping = false;
                this.velocityY = 1;
            }
        }

        // Actualiza las animaciones
        if (this.animations) {
            this.animations.update(deltaTime);
        }

        // Decide qué animación reproducir
        if (this.isJumping) {
            this.animations.play('jump');
        } else if (this.velocity.length() > 0) {
            this.animations.play('run');
        } else {
            this.animations.play('idle');
        }

        // Actualiza la rotación y la cámara
        this.model.rotation.y = this.yaw;
        this.updateCameraPosition();
    }

    updateCameraPosition() {
        const offsetX = Math.sin(this.yaw) * this.cameraOffset.z + Math.cos(this.yaw) * this.cameraOffset.x;
        const offsetZ = Math.cos(this.yaw) * this.cameraOffset.z - Math.sin(this.yaw) * this.cameraOffset.x;

        const cameraPosition = new THREE.Vector3(
            this.model.position.x + offsetX,
            this.model.position.y + this.cameraOffset.y,
            this.model.position.z + offsetZ
        );

        this.camera.position.copy(cameraPosition);

        const lookAtPoint = new THREE.Vector3(
            this.model.position.x + this.cameraLookAtOffset.x,
            this.model.position.y + this.cameraLookAtOffset.y,
            this.model.position.z + this.cameraLookAtOffset.z
        );

        lookAtPoint.y -= Math.tan(this.pitch) * this.cameraOffset.z;
        this.camera.lookAt(lookAtPoint);
    }

    onMouseMove(event) {
        if (document.pointerLockElement === document.body) {
            this.yaw -= event.movementX * this.mouseSensitivity;
            this.pitch -= event.movementY * this.mouseSensitivity;
            this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 2.8, this.pitch));
        }
    }

    loadAnimations() {
        // Carga tus animaciones aquí
        this.animations.loadAnimation('idle', '../animations/player/Idle.fbx');
        this.animations.loadAnimation('run', '../animations/player/Running.fbx');
        this.animations.loadAnimation('jump', '../animations/player/Jump.fbx');
        // Añade más animaciones según sea necesario
    }
}
