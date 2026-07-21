import * as THREE from 'three';

export class LODManager {
    constructor() {
        this.lodObjects = [];
        this.enabled = true;
        this.dynamicLOD = true;
        this.isMoving = false;
        this.thresholdTriangles = 5000; // Ngưỡng để áp dụng LOD cho mesh (số lượng tam giác)
    }

    /**
     * Quét và áp dụng LOD cho một mô hình 3D vừa được tải
     * @param {THREE.Object3D} model 
     */
    applyLOD(model) {
        if (!this.enabled) return;

        const meshesToReplace = [];

        // Bước 1: Quét tất cả các mesh trong mô hình
        model.traverse((child) => {
            if (child.isMesh && !child.parent.isLOD && child.geometry) {
                // Tính số lượng tam giác
                let triangleCount = 0;
                if (child.geometry.index) {
                    triangleCount = child.geometry.index.count / 3;
                } else if (child.geometry.attributes.position) {
                    triangleCount = child.geometry.attributes.position.count / 3;
                }

                if (triangleCount > this.thresholdTriangles) {
                    meshesToReplace.push(child);
                }
            }
        });

        // Bước 2: Thay thế từng mesh nặng bằng một đối tượng THREE.LOD
        meshesToReplace.forEach((mesh) => {
            const parent = mesh.parent;
            if (!parent) return;

            // Tính toán kích thước hình học
            mesh.geometry.computeBoundingBox();
            const bbox = mesh.geometry.boundingBox;
            const size = new THREE.Vector3();
            bbox.getSize(size);
            const center = new THREE.Vector3();
            bbox.getCenter(center);

            const maxDim = Math.max(size.x, size.y, size.z);

            // Tạo đối tượng LOD
            const lod = new THREE.LOD();
            lod.name = mesh.name + "_LOD";
            
            // Sao chép các thuộc tính biến đổi của mesh gốc sang LOD
            lod.position.copy(mesh.position);
            lod.rotation.copy(mesh.rotation);
            lod.scale.copy(mesh.scale);
            lod.castShadow = mesh.castShadow;
            lod.receiveShadow = mesh.receiveShadow;

            // Cấp độ 0 (Cao): Mesh gốc (với các biến đổi cục bộ được reset vì LOD đã mang nó)
            const highMesh = mesh.clone();
            highMesh.position.set(0, 0, 0);
            highMesh.rotation.set(0, 0, 0);
            highMesh.scale.set(1, 1, 1);
            lod.addLevel(highMesh, 0);

            // Cấp độ 1 (Thấp): Bounding Box cách điệu (Glassmorphism + Neon Outline)
            const lowGroup = new THREE.Group();
            lowGroup.name = mesh.name + "_LowDetail";

            // 1. Tạo hộp bán trong suốt (Glossy Glass)
            const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
            boxGeo.translate(center.x, center.y, center.z); // dịch chuyển tâm trùng khớp

            const glassMat = new THREE.MeshStandardMaterial({
                color: 0x00d2ff,
                transparent: true,
                opacity: 0.15,
                roughness: 0.1,
                metalness: 0.9,
                side: THREE.DoubleSide
            });
            const glassMesh = new THREE.Mesh(boxGeo, glassMat);
            lowGroup.add(glassMesh);

            // 2. Tạo viền hộp gọn gàng sắc nét (Neon Outline)
            const edgesGeo = new THREE.EdgesGeometry(boxGeo);
            const lineMat = new THREE.LineBasicMaterial({
                color: 0x00d2ff,
                transparent: true,
                opacity: 0.6,
                linewidth: 1.5
            });
            const outline = new THREE.LineSegments(edgesGeo, lineMat);
            lowGroup.add(outline);

            // Xác định khoảng cách kích hoạt LOD dựa trên kích thước cấu kiện
            // Cấu kiện càng nhỏ thì càng nhanh bị chuyển sang LOD thấp khi lùi camera ra xa
            const lodDistance = Math.max(maxDim * 10, 8);
            lod.addLevel(lowGroup, lodDistance);

            // Thay thế mesh cũ bằng LOD trong cấu trúc cây Scene
            parent.add(lod);
            parent.remove(mesh);

            // Lưu lại tham chiếu để quản lý
            this.lodObjects.push(lod);
        });

        console.log(`Đã tối ưu LOD thành công cho ${meshesToReplace.length} cấu kiện nặng.`);
    }

    /**
     * Dọn dẹp bộ nhớ LOD khi xóa mô hình
     */
    clear() {
        this.lodObjects = [];
    }

    /**
     * Cập nhật trạng thái LOD trước khi render
     * @param {THREE.Camera} camera 
     */
    update(camera) {
        if (!this.enabled) return;

        const forceLow = this.dynamicLOD && this.isMoving;

        for (let i = 0; i < this.lodObjects.length; i++) {
            const lod = this.lodObjects[i];
            
            // Kiểm tra xem LOD có còn nằm trong scene không
            if (!lod.parent) {
                this.lodObjects.splice(i, 1);
                i--;
                continue;
            }

            if (forceLow) {
                // Buộc hiển thị cấp độ thấp nhất (LOD 1)
                lod.children.forEach((child, idx) => {
                    child.visible = (idx === 1);
                });
            } else {
                // Để Three.js tự động tính toán LOD theo khoảng cách camera
                lod.update(camera);
            }
        }
    }

    /**
     * Đếm số lượng lưới (meshes) đang ở mức độ chi tiết cao hay thấp
     * @returns {Object}
     */
    getStats() {
        let highCount = 0;
        let lowCount = 0;

        this.lodObjects.forEach((lod) => {
            if (lod.children[0] && lod.children[0].visible) {
                highCount++;
            } else if (lod.children[1] && lod.children[1].visible) {
                lowCount++;
            }
        });

        return {
            totalLODs: this.lodObjects.length,
            highCount,
            lowCount
        };
    }
}
