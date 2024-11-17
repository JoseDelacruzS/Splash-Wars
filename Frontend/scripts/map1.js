import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Map {
    constructor(scene, camera) {
        if (!scene || !(scene instanceof THREE.Scene)) {
            throw new Error("Se requiere una instancia válida de THREE.Scene para 'scene'.");
        }
        if (!camera || !(camera instanceof THREE.Camera)) {
            throw new Error("Se requiere una instancia válida de THREE.Camera para 'camera'.");
        }

        this.camera = camera;
        this.scene = scene;
        this.skydomeMesh = null;
        this.planeCollisionBox = null;
        this.audioListener = new THREE.AudioListener();
        this.backgroundMusic = new THREE.Audio(this.audioListener);

        console.log("Inicializando mapa con escena y cámara:", this.scene, this.camera);

        this.init();
    }

    async init() {
        try {
            await this.loadStage();
            this.addSkydome();
            this.addPlane();
            this.setupAudio();
        } catch (error) {
            console.error("Error al inicializar el mapa:", error);
        }
    }

    async addSkydome() {
        try {
            const skydomeGeometry = new THREE.SphereGeometry(500, 60, 40);
            const skyTexture = await this.loadTexture('../assets/images/cielo.png');
            const skydomeMaterial = new THREE.MeshBasicMaterial({
                map: skyTexture,
                side: THREE.BackSide
            });

            this.skydomeMesh = new THREE.Mesh(skydomeGeometry, skydomeMaterial);
            this.scene.add(this.skydomeMesh);

            // Rotación
            this.skydomeRotationSpeed = 0.00008;
            this.animateSkydome();
        } catch (error) {
            console.error("Error al agregar el Skydome:", error);
        }
    }

    animateSkydome() {
        requestAnimationFrame(() => this.animateSkydome());
        this.skydomeMesh.rotation.y += this.skydomeRotationSpeed;
        if (this.skydomeMesh.rotation.y > Math.PI * 2 || this.skydomeMesh.rotation.y < 0) {
            this.skydomeRotationSpeed = -this.skydomeRotationSpeed;
        }
    }

    addPlane() {
        try {
            const planeGeometry = new THREE.PlaneGeometry(600, 600);
            const edges = new THREE.EdgesGeometry(planeGeometry);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); // Color blanco para las líneas
            const planeLines = new THREE.LineSegments(edges, lineMaterial);
            planeLines.rotation.x = -Math.PI / 2;
            planeLines.position.y = 0.3; // Ajusta esto según sea necesario
            this.scene.add(planeLines);
            this.planeCollisionBox = new THREE.Box3().setFromObject(planeLines);
        } catch (error) {
            console.error("Error al agregar el plano:", error);
        }
    }

    setupAudio() {
        try {
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load(
                '../assets/sounds/music/Musica1.mp3',
                (buffer) => {
                    this.backgroundMusic.setBuffer(buffer);
                    this.backgroundMusic.setLoop(true);
                    this.backgroundMusic.setVolume(0.5); // Cambiado a un valor entre 0 y 1
                    this.backgroundMusic.play();
                },
                undefined,
                (error) => {
                    console.error('Error al cargar el audio:', error);
                }
            );
        } catch (error) {
            console.error("Error al configurar el audio:", error);
        }
    }

    // Usamos una función async para cargar texturas
    loadTexture(url) {
        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(
                url,
                resolve, // Si carga bien, resolver la promesa con la textura
                undefined,
                reject // Si hay error, rechazar la promesa
            );
        });
    }

    async loadStage() {
        try {
            const loader = new GLTFLoader();
            const gltf = await this.loadGLTFModel('../assets/models/scenarios/low_poly_city/city.glb');
            console.log('Modelo cargado con éxito:', gltf);
            const stage = gltf.scene;
            stage.scale.set(12, 12, 12);
            stage.position.set(0, 0, 0);
            this.scene.add(stage); // Agrega el escenario a la escena
        } catch (error) {
            console.error('Error al cargar el escenario:', error);
        }
    }

    // Usamos una función async para cargar el modelo GLTF
    loadGLTFModel(url) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                url,
                resolve,
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% cargado');
                },
                reject
            );
        });
    }

    update() {
        try {
            if (this.camera && this.audioListener) {
                this.audioListener.position.copy(this.camera.position);
            } else {
                console.warn("No se puede actualizar la posición del AudioListener: cámara o audioListener no definidos.");
            }
        } catch (error) {
            console.error("Error en el método 'update':", error);
        }
    }
}
