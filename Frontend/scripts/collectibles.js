import * as THREE from 'three';

export class Collectibles {
    constructor(scene) {
        this.scene = scene;
        this.objects = []; // Almacena los objetos recolectables
    }

    // Método para crear un objeto recolectable
    createCollectible(position, color = 0xff0000) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color });
        const collectible = new THREE.Mesh(geometry, material);

        collectible.position.copy(position); // Posición del objeto
        this.scene.add(collectible);
        this.objects.push(collectible);
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
}
