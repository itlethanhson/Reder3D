import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import * as THREE from 'three';
import { MeshBVHManager } from '../utils/meshBVHManager.js';

export class STLLoaderWrapper {
    constructor(app) {
        this.app = app;
        this.loader = new STLLoader();
    }

    /**
     * Loads an STL file object
     * @param {File} file 
     * @returns {Promise<THREE.Group>}
     */
    async load(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);

            this.loader.load(
                url,
                (geometry) => {
                    // STL geometries often lack normal information, compute it
                    geometry.computeVertexNormals();

                    // Center geometry
                    geometry.center();

                    // Create high-quality neutral material
                    const material = new THREE.MeshStandardMaterial({
                        color: 0xf3f4f6, // Bright clean off-white
                        metalness: 0.15, // Soft metalness
                        roughness: 0.45, // Semi-glossy plastic/matte finish
                        side: THREE.DoubleSide
                    });

                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.name = file.name.substring(0, file.name.lastIndexOf('.')) || "STL_Mesh";

                    // Wrap in a group for interface consistency
                    const group = new THREE.Group();
                    group.name = file.name || "STL_Model";
                    group.add(mesh);

                    URL.revokeObjectURL(url);
                    resolve(group);
                    
                    // Khởi chạy tiến trình reveal lũy tiến & LOD
                    this.app.progressiveActive = true;
                    import('../utils/progressiveLoader.js').then(async ({ ProgressiveLoader }) => {
                        await ProgressiveLoader.revealProgressively(group, this.app, 15);
                        
                        // Áp dụng MeshBVH sau khi nạp xong
                        MeshBVHManager.applyBVH(group);

                        if (window.lodManager) {
                            window.lodManager.applyLOD(group);
                        }

                        this.app.progressiveActive = false;
                        this.app.setLoading(false);

                        if (typeof window !== 'undefined' && window.dispatchEvent) {
                            window.dispatchEvent(new CustomEvent('model-loaded-complete', { detail: { model: group } }));
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
