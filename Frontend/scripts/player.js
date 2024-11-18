import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { PlayerAnimations } from './playerAnimations.js';

export class Player {
    constructor(scene, camera, socket) {
        this.scene = scene;
        this.camera = camera;
        this.socket = socket;
        this.model = null;
        this.velocity = new THREE.Vector3();
        this.moveSpeed = 7;

        //Camara
        this.cameraOffset = new THREE.Vector3(0, 3, -3);
        this.cameraLookAtOffset = new THREE.Vector3(0, 4.5, 0);

        this.mouseSensitivity = 0.001;
        this.pitch = 0;
        this.yaw = 0;
        this.PlayerAnimations = null;

        //Salto
        this.isJumping = false;
        this.jumpVelocity = 5;
        this.gravity = -9.81;
        this.velocityY = 10;
        this.jumpHeight = 100;

        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false // Agregar espacio para el salto
        };

        this.loadModel();
        this.setupKeyboardControls();
        this.setupMouseControls();
    }

    loadModel() {
        const loader = new FBXLoader();
        loader.load(
            '../assets/models/Player/source/little_boy_2.fbx',
            (object) => {
                this.model = object;
                this.model.scale.set(.03, .03, .03);
                this.model.position.set(0, 4, 0);
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

    loadTexture() {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('../assets/models/Player/textures/little_boy_2.png', (texture) => {
            this.model.traverse((child) => {
                if (child.isMesh) {
                    const material = new THREE.MeshLambertMaterial({
                        map: texture,
                        color: 0xffffff,
                        transparent: true,
                    });
                    child.material = material;
                    child.material.needsUpdate = true;
                }
            });
        });
    }

    // Función para actualizar la posición del jugador
    updatePosition(position) {
        this.model.position.set(position.x, position.y, position.z);
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => this.onKeyDown(event), false);
        document.addEventListener('keyup', (event) => this.onKeyUp(event), false);
    }

    onKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w': this.keys.w = true; break;
            case 'a': this.keys.a = true; break;
            case 's': this.keys.s = true; break;
            case 'd': this.keys.d = true; break;
            case ' ': // Espacio para saltar
                if (!this.isJumping) {
                    this.isJumping = true;
                    this.velocityY = this.jumpVelocity; // Iniciar el salto
                }
                break;
        }
    }

    onKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w': this.keys.w = false; break;
            case 'a': this.keys.a = false; break;
            case 's': this.keys.s = false; break;
            case 'd': this.keys.d = false; break;
        }
    }

    setupMouseControls() {
        document.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange(), false);
        document.body.addEventListener('click', () => this.requestPointerLock(), false);
    }

    requestPointerLock() {
        document.body.requestPointerLock();
    }

    onPointerLockChange() {
        if (document.pointerLockElement === document.body) {
            console.log("Pointer locked");
        } else {
            console.log("Pointer unlocked");
        }
    }

    update(deltaTime) {
        if (!this.model) return;
        this.velocity.set(0, 0, 0);

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

        if (this.isJumping) {
            this.velocityY += this.gravity * deltaTime;
            this.model.position.y += this.velocityY * deltaTime;

            if (this.model.position.y <= 3) {
                this.model.position.y = 1;
                this.isJumping = false;
                this.velocityY = 1;
            }
        }

        if (this.animations) {
            this.animations.update(deltaTime);
        }

        if (this.isJumping) {
            this.animations.play('jump');
        } else if (this.velocity.length() > 0) {
            this.animations.play('run');
        } else {
            this.animations.play('idle');
        }

        this.model.rotation.y = this.yaw;

        this.updateCameraPosition();
        this.sendPositionToServer();
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

        this.camera.lookAt(lookAtPoint);
    }

    sendPositionToServer() {
        // Enviar posición al servidor usando socket
        this.socket.emit('updatePosition', {
            x: this.model.position.x,
            y: this.model.position.y,
            z: this.model.position.z
        });
    }
}
