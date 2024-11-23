import * as THREE from 'three';
import { HUD } from './hud.js';
import { Map } from './map1.js';
import { Player } from './player.js';
import { Collectibles } from './collectibles.js';

export default class GameScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.player = null;
        this.hud = new HUD();
        this.map = null;
        this.timeSinceLastSpawn = 0; // Tiempo acumulado desde la última generación
        this.spawnInterval = 5; // Intervalo de 10 segundos

        this.init();
        this.animate();
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
        directionalLight.position.set(0, 10, 0);
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    loadGameElements() {
        this.map = new Map(this.scene, this.camera);
        this.loadPlayer();

         // Inicializar recolectables
    this.collectibles = new Collectibles(this.scene);

    // Agregar algunos recolectables como ejemplo
    //this.collectibles.createCollectible1(new THREE.Vector3(5, 1, 5));
    //this.collectibles.createCollectible1(new THREE.Vector3(-3, 1, 2));
    //this.collectibles.createCollectible2(new THREE.Vector3(0, 1, -4)); // Crea un cono 
    //this.collectibles.createCollectibleSphere(new THREE.Vector3(2, 1, -5), 0xffff00); // Esfera amarilla
    //this.collectibles.createCollectibleSphere(new THREE.Vector3(-1, 1, 3), 0x00ff00); // Esfera verde

    //this.collectibles.createFBXCollectible(new THREE.Vector3(5, 1, 6), '"/assets/models/scenarios/collectibles/wtgun.fbx"', 1);   

    
     }

    
    loadPlayer() {
        this.player = new Player(this.scene, this.camera);
    }

    update() {
        const deltaTime = this.clock.getDelta();
        if (this.player) {
            this.player.update(deltaTime,this.collectibles);
        }
        if (this.map) {
            this.map.update();
        }

    this.timeSinceLastSpawn += deltaTime;

    // Verificar si ha pasado el intervalo
    if (this.timeSinceLastSpawn >= this.spawnInterval) {
        this.clearCollectibles(); // Elimina recolectables actuales
        for (let i = 0; i < 1; i++) {
            this.generateRandomCollectible(); // Genera 5 nuevos recolectables
        }
        this.timeSinceLastSpawn = 0; // Reinicia el temporizador
    }

    if (this.player) {
        this.player.update(deltaTime, this.collectibles);
    }
    if (this.map) {
        this.map.update();
    }
    }

    clearCollectibles() {
        this.collectibles.getCollectibles().forEach((object) => {
            this.collectibles.removeCollectible(object);
        });
    }

    generateRandomCollectible() {
        // Generar un número aleatorio entre 1 y 100
        const randomNumber = Math.floor(Math.random() * 100) + 1;
    
        // Ajustar los rangos para decidir qué recolectable crear
        if (randomNumber >= 1 && randomNumber <= 32) { 
            this.collectibles.createCollectible1(new THREE.Vector3(-3, 1, 2)); // Objeto 1
        } else if (randomNumber > 33 && randomNumber <= 65) { 
            this.collectibles.createCollectible2(new THREE.Vector3(0, 1, -4)); // Cono
        } else { 
            this.collectibles.createCollectibleSphere(new THREE.Vector3(5, 1, 5), 0x00ff00); // Esfera
        }
    
        console.log(`Número aleatorio generado: ${randomNumber}`);
    }
    
   

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    initHUD() {
        if (this.hud) {
            this.hud.updateLife(100);
            this.hud.updateTimer(120);
            this.hud.updateAmmo(15);
        } else {
            console.error('HUD no está inicializado');
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
    }
}