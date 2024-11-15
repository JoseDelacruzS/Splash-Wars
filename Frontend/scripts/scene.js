import * as THREE from 'three';
import { HUD } from './hud.js';
import { Map } from './map1.js';

export default class GameScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.map = null;

        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupEventListeners();
        this.loadGameElements();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(this.scene.position);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 10).normalize();
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    loadGameElements() {
        this.hud = new HUD();
        this.map = new Map(this.scene);
    }

    render() {
        const deltaTime = this.clock.getDelta();
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        const deltaTime = this.clock.getDelta();
        this.hud.update(deltaTime);
        this.map.update(deltaTime);
    }
}
