import * as THREE from 'three';
import { HUD } from './hud.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Player }  from './player.js';

export default class GameScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock(); // Inicializa el reloj
        this.player = null;

        this.hud = new HUD();
        this.init();
        this.animate(); // Inicia el bucle de animación
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Configurar la cámara
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(this.scene.position);

        // Añadir iluminación básica
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        this.scene.add(directionalLight);


        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.loadStage();
        this.addSkydome();
        this.loadPlayer();
        this.addPlane();
    }


    addSkydome() {
        const skydomeGeometry = new THREE.SphereGeometry(500, 60, 40);
        const skyTexture = new THREE.TextureLoader().load('./assets/images/cielo.png');
        const skydomeMaterial = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide
        });
        this.skydomeMesh = new THREE.Mesh(skydomeGeometry, skydomeMaterial); // Almacena el skydome en una propiedad
        this.scene.add(this.skydomeMesh);
    }

    update() {
        const deltaTime = this.clock.getDelta();
        if (this.player) {
            this.player.update(deltaTime);
        }

        this.skydomeMesh.rotation.y += 0.0001; // Ajusta la velocidad de rotación según sea necesario
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
        if (this.hud) {  // Verifica que this.hud exista
            this.hud.updateLife(100);
            this.hud.updateTimer(120);
            this.hud.updateAmmo(15);
        } else {
            console.error('HUD no está inicializado');
        }
    }

    addPlane() {
        // Crear la geometría del plano
        const planeGeometry = new THREE.PlaneGeometry(600, 600);
        
        // Crear la geometría del plano solo con líneas
        const edges = new THREE.EdgesGeometry(planeGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); // Color blanco para las líneas
        const planeLines = new THREE.LineSegments(edges, lineMaterial);
    
        // Rotar el plano para que sea horizontal
        planeLines.rotation.x = -Math.PI / 2;
    
        // Posicionar el plano
        planeLines.position.y = 0.3; // Ajusta esto según sea necesario
    
        // Agregar el plano a la escena
        this.scene.add(planeLines);
    
        // Guardar la geometría del plano para colisiones
        this.planeCollisionBox = new THREE.Box3().setFromObject(planeLines);
    }
    
    loadPlayer() {
        this.player = new Player(this.scene, this.camera);
    }
    
    // Método para verificar colisiones
    checkCollisions() {
        if (this.playerCollisionBox.intersectsBox(this.planeCollisionBox)) {
            console.log('Colisión detectada entre el jugador y el plano');
            // Manejar la colisión aquí
        }
    }

    loadStage() {
        const loader = new GLTFLoader(); // O FBXLoader si tu modelo es FBX
        loader.load(
            '/Frontend/assets/models/scenarios/low_poly_city/city.glb', // Cambia esto a la ruta de tu modelo
            (gltf) => {
                const stage = gltf.scene; // Obtiene la escena del modelo GLB
                stage.scale.set(12, 12, 12); // Ajusta la escala si es necesario
                stage.position.set(0, 0, 0); // Ajusta la posición según sea necesario
                this.scene.add(stage); // Agrega el escenario a la escena
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progreso de carga
            },
            (error) => {
                console.error('An error happened', error); // Manejo de errores
            }
        );
    }

    animate() {
        requestAnimationFrame(() => this.animate()); // Llama a animate en el siguiente frame
        this.update(); // Actualiza la escena
        this.render(); // Renderiza la escena
    }

}