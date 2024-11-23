import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Collectibles {
    constructor(scene) {
        this.scene = scene;
        this.objects = []; // Almacena los objetos recolectables
    }

    // Método para crear un objeto recolectable
    createCollectible1(position, color = 0xff0000) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color });
        const collectible = new THREE.Mesh(geometry, material);

        collectible.position.copy(position); // Posición del objeto
        this.scene.add(collectible);
        this.objects.push(collectible);
    }

    createCollectible2(position, color = 0xff0002) {
        const geometry2 = new THREE.ConeGeometry(0.5, 1, 16); // Radio base: 0.5, Altura: 1, Segmentos radiales: 16
        const material2 = new THREE.MeshBasicMaterial({ color });
        const collectible2 = new THREE.Mesh(geometry2, material2);

        collectible2.position.copy(position); // Posición del objeto
        this.scene.add(collectible2);
        this.objects.push(collectible2);
    }

    createCollectibleSphere(position, color = 0x01ff00) {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Radio: 0.5, Segmentos: 32x32
        const material = new THREE.MeshBasicMaterial({ color });
        const collectible = new THREE.Mesh(geometry, material);
    
        collectible.position.copy(position); // Posición del objeto
        this.scene.add(collectible);
        this.objects.push(collectible);
    }
    

    
    // Método para cargar un modelo FBX como recolectable
    createFBXCollectible(position, modelPath, scale = 0.01) {
        const loader = new FBXLoader();
        loader.load(
            modelPath,
            (object) => {
                object.scale.set(scale, scale, scale);
                object.position.copy(position);
                object.boundingBox = new THREE.Box3().setFromObject(object); // Generar caja de colisión
                this.scene.add(object);
                this.objects.push(object);
            },
            (xhr) => {
                console.log(`FBX collectible ${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error) => {
                console.error('Error loading FBX collectible:', error);
            }
        );
    }


    // Método para eliminar un objeto recolectable
    removeCollectible(object) {
        this.scene.remove(object); // Remover de la escena
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1); // Remover de la lista
        }
    }

    // Obtener todos los objetos recolectables
    getCollectibles() {
        return this.objects;
    }


    //Actualizar las cajas de colisión (llamar durante el ciclo de animación si los modelos tienen animación)
    updateBoundingBoxes() {
        this.objects.forEach((object) => {
            if (object.boundingBox) {
                object.boundingBox.setFromObject(object);
            }
        });
    }
}
