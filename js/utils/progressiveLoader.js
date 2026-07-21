import * as THREE from 'three';

export class ProgressiveLoader {
    /**
     * Hiển thị mô hình một cách lũy tiến bằng cách ẩn toàn bộ mesh ban đầu
     * và cho xuất hiện lại theo từng cụm nhỏ (áp dụng tốt cho GLTF, STL, OBJ)
     * @param {THREE.Object3D} model - Mô hình 3D cần hiển thị
     * @param {Object} app - loaderAppInterface để cập nhật % tiến độ tải
     * @param {Number} [batchSize=15] - Số lượng mesh hiển thị mỗi khung hình
     * @returns {Promise<void>}
     */
    static async revealProgressively(model, app, batchSize = 15) {
        return new Promise((resolve) => {
            const meshes = [];
            
            // Thu thập tất cả các mesh trong mô hình
            model.traverse((child) => {
                if (child.isMesh) {
                    meshes.push(child);
                    child.visible = false; // Ẩn đi lúc đầu
                }
            });

            const total = meshes.length;
            if (total === 0) {
                resolve();
                return;
            }

            let currentIndex = 0;

            function revealBatch() {
                const limit = Math.min(currentIndex + batchSize, total);
                for (let i = currentIndex; i < limit; i++) {
                    meshes[i].visible = true;
                }
                currentIndex = limit;

                // Cập nhật tiến trình hiển thị trên UI (từ 0% đến 100%)
                const percent = (currentIndex / total) * 100;
                app.updateLoadingProgress(percent);

                if (currentIndex < total) {
                    requestAnimationFrame(revealBatch);
                } else {
                    resolve();
                }
            }

            requestAnimationFrame(revealBatch);
        });
    }

    /**
     * Dựng hình và chèn các cấu kiện lắp ráp vào scene một cách lũy tiến
     * (áp dụng cực tốt cho STEP để tránh làm đứng trình duyệt khi dựng hình)
     * @param {Array<Object>} itemsData - Mảng dữ liệu thô để tạo mesh
     * @param {Function} buildFn - Hàm nhận dữ liệu thô và trả về THREE.Object3D/Group
     * @param {THREE.Group} targetGroup - Group đích để thêm mesh vào scene
     * @param {Object} app - loaderAppInterface để cập nhật % tiến độ
     * @param {Number} [batchSize=8] - Số lượng mesh xử lý mỗi khung hình
     * @returns {Promise<void>}
     */
    static async buildProgressively(itemsData, buildFn, targetGroup, app, batchSize = 8) {
        return new Promise((resolve) => {
            const total = itemsData.length;
            if (total === 0) {
                resolve();
                return;
            }

            let currentIndex = 0;

            function buildBatch() {
                const limit = Math.min(currentIndex + batchSize, total);
                for (let i = currentIndex; i < limit; i++) {
                    const modelPart = buildFn(itemsData[i], i);
                    if (modelPart) {
                        targetGroup.add(modelPart);
                    }
                }
                currentIndex = limit;

                // Cập nhật tiến độ tải
                const percent = (currentIndex / total) * 100;
                app.updateLoadingProgress(percent);

                if (currentIndex < total) {
                    requestAnimationFrame(buildBatch);
                } else {
                    resolve();
                }
            }

            requestAnimationFrame(buildBatch);
        });
    }
}
