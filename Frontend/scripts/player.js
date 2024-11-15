import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { PlayerAnimations } from './playerAnimations.js';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.model = null;
        this.velocity = new THREE.Vector3();
        this.moveSpeed = 7;

        // Camera offsets
        this.cameraOffset = new THREE.Vector3(0, 5.5, -3);
        this.cameraLookAtOffset = new THREE.Vector3(0, 4.5, 0);

        this.mouseSensitivity = 0.001;
        this.pitch = 0;
        this.yaw = 0;
        this.animations = null;

        // Jumping
        this.isJumping = false; 
        this.jumpVelocity = 5;
        this.gravity = -9.81; 
        this.velocityY = 0; 

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

    setupKeyboardControls() {
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };

        document.addEventListener('keydown', (event) => this.onKeyDown(event), false);
        document.addEventListener('keyup', (event) => this.onKeyUp(event), false);
    }

    onKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w': this.keys.w = true; break;
            case 'a': this.keys.a = true; break;
            case 's': this.keys.s = true; break;
            case 'd': this.keys.d = true; break;
            case ' ': // Space to jump
                if (!this.isJumping) {
                    this.isJumping = true;
                    this.velocityY = this.jumpVelocity; // Start jump
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

        // Rotation matrix based on model's rotation
        const rotationMatrix = new THREE.Matrix4 ();
        rotationMatrix.makeRotationY(this.model.rotation.y);

        // Basic movement directions (forward, right, etc.)
        const forward = new THREE.Vector3(0, 0, 1);
        const right = new THREE.Vector3(-1, 0, 0);

        // Apply rotation to directions
        forward.applyMatrix4(rotationMatrix);
        right.applyMatrix4(rotationMatrix);

        // Update velocity based on pressed keys
        if (this.keys.w) this.velocity.add(forward);  // Forward
        if (this.keys.s) this.velocity.sub(forward);  // Backward
        if (this.keys.a) this.velocity.sub(right);    // Left
        if (this.keys.d) this.velocity.add(right);    // Right

        // Normalize velocity to prevent faster diagonal movement
        if (this.velocity.length() > 0) {
            this.velocity.normalize().multiplyScalar(this.moveSpeed * deltaTime);
            this.model.position.add(this.velocity);
        }

        // Jump handling
        if (this.isJumping) {
            this.velocityY += this.gravity * deltaTime; // Apply gravity
            this.model.position.y += this.velocityY * deltaTime; // Update Y position

            // Check if player has landed
            if (this.model.position.y <= 1) { // Assuming 1 is the ground height
                this.model.position.y = 1; // Adjust position to ground
                this.isJumping = false; // Player is no longer jumping
                this.velocityY = 0; // Reset vertical velocity
            }
        }

        // Update animations
        if (this.animations) {
            this.animations.update(deltaTime);
        }

        // Decide which animation to play based on player state
        if (this.isJumping) {
            this.animations.play('jump');  // Play jump animation
        } else if (this.velocity.length() > 0) {
            this.animations.play('run');  // Play run animation
        } else {
            this.animations.play('idle');  // Play idle animation
        }

        // Update model rotation to face where the camera is pointing
        this.model.rotation.y = this.yaw;

        // Update camera position
        this.updateCameraPosition();
        socket.emit('updatePosition', { x: this.model.position.x, y: this.model.position.y, z: this.model.position.z });
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

        // Calculate look-at point
        const lookAtPoint = new THREE.Vector3(
            this.model.position.x + this.cameraLookAtOffset.x,
            this.model.position.y + this.cameraLookAtOffset.y,
            this.model.position.z + this.cameraLookAtOffset.z
        );

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
        // Load your animations here
        this.animations.loadAnimation('idle', '../animations/player/Idle.fbx');
        this.animations.loadAnimation('run', '../animations/player/Running.fbx');
        this.animations.loadAnimation('jump', '../animations/player/Jump.fbx');
        // Add more animations as needed
    }
}