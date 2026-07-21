import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';
import { MeshBVHManager } from '../utils/meshBVHManager.js';

export class OBJLoaderWrapper {
    constructor(app) {
        this.app = app;
        this.loader = new OBJLoader();
    }

    /**
     * Loads an OBJ file object
     * @param {File} file 
     * @returns {Promise<THREE.Group>}
     */
    async load(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);

            this.loader.load(
                url,
                (obj) => {
                    obj.name = file.name || "OBJ_Model";

                    // Center model bounds
                    const box = new THREE.Box3().setFromObject(obj);
                    const center = box.getCenter(new THREE.Vector3());
                    obj.position.sub(center);

                    // Standard fallbacks if no materials exist
                    const defaultMat = new THREE.MeshStandardMaterial({
                        color: 0xf3f4f6,
                        metalness: 0.15,
                        roughness: 0.45,
                        side: THREE.DoubleSide
                    });

                    obj.traverse((node) => {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                            
                            // If mesh doesn't have custom material, apply default
                            if (!node.material || (Array.isArray(node.material) && node.material.length === 0)) {
                                node.material = defaultMat;
                            } else {
                                if (Array.isArray(node.material)) {
                                    node.material.forEach((mat) => {
                                        mat.side = THREE.DoubleSide;
                                    });
                                } else {
                                    node.material.side = THREE.DoubleSide;
                                }
                            }
                        }
                    });

                    URL.revokeObjectURL(url);
                    resolve(obj);
                    
                    // Khởi chạy tiến trình reveal lũy tiến & LOD
                    this.app.progressiveActive = true;
                    import('../utils/progressiveLoader.js').then(async ({ ProgressiveLoader }) => {
                        await ProgressiveLoader.revealProgressively(obj, this.app, 12);
                        
                        // Áp dụng MeshBVH sau khi nạp xong
                        MeshBVHManager.applyBVH(obj);

                        if (window.lodManager) {
                            window.lodManager.applyLOD(obj);
                        }

                        this.app.progressiveActive = false;
                        this.app.setLoading(false);

                        if (typeof window !== 'undefined' && window.dispatchEvent) {
                            window.dispatchEvent(new CustomEvent('model-loaded-complete', { detail: { model: obj } }));
                        }
                    });
                },
                (progress) => {
                    if (progress.total > 0) {
                        const percent = (progress.loaded / progress.total) * 100;
                        this.app.updateLoadingProgress(percent);
                    }
                },
                (error) => {
                    URL.revokeObjectURL(url);
                    reject(error);
                }
            );
        });
    }
}
