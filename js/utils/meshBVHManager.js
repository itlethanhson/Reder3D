import * as THREE from 'three';

export class MeshBVHManager {
    /**
     * Initializes three-mesh-bvh for accelerating heavy model raycasting (selection, measurement)
     */
    static async initialize() {
        try {
            // Attempt to dynamically load from importmap definition
            const bvhModule = await import('three-mesh-bvh');
            
            if (bvhModule) {
                // Attach BVH functions to Three prototypes
                THREE.BufferGeometry.prototype.computeBoundsTree = bvhModule.computeBoundsTree;
                THREE.BufferGeometry.prototype.disposeBoundsTree = bvhModule.disposeBoundsTree;
                THREE.Mesh.prototype.raycast = bvhModule.acceleratedRaycast;
                
                console.log("Hệ thống tối ưu Mesh BVH đã khởi động thành công!");
                return true;
            }
        } catch (error) {
            console.warn("Thư viện three-mesh-bvh chưa sẵn sàng. Raycasting sẽ chạy ở chế độ tiêu chuẩn.", error);
        }
        return false;
    }

    /**
     * Computes bounds tree recursively on a loaded assembly model to accelerate checks
     * @param {THREE.Object3D} model 
     */
    static applyBVH(model) {
        if (!THREE.BufferGeometry.prototype.computeBoundsTree) return;

        model.traverse((child) => {
            if (child.isMesh && child.geometry) {
                // Compute BVH bounds tree
                child.geometry.computeBoundsTree();
            }
        });
    }

    /**
     * Disposes bounds tree recursively to release WebAssembly / JS memory
     * @param {THREE.Object3D} model 
     */
    static disposeBVH(model) {
        if (!THREE.BufferGeometry.prototype.disposeBoundsTree) return;

        model.traverse((child) => {
            if (child.isMesh && child.geometry && child.geometry.disposeBoundsTree) {
                child.geometry.disposeBoundsTree();
            }
        });
    }
}

// Automatically trigger initialization when this module is loaded
MeshBVHManager.initialize();
