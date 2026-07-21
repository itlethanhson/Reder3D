import * as THREE from 'three';
import { MeshBVHManager } from '../utils/meshBVHManager.js';

export class STEPLoaderWrapper {
    constructor(app) {
        this.app = app;
    }

    /**
     * Loads a STEP (.step/.stp) file object using occt-import-js
     * @param {File} file 
     * @returns {Promise<THREE.Group>}
     */
    async load(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const buffer = e.target.result;
                const fileBuffer = new Uint8Array(buffer);

                try {
                    // Check if occt-import-js is loaded on window
                    if (typeof occtimportjs === 'undefined') {
                        // Dynamically import from CDN if local copy doesn't exist
                        await this.loadOCCTScript();
                    }

                    if (typeof occtimportjs === 'undefined') {
                        throw new Error('Thư viện occt-import-js chưa được tải!');
                    }

                    this.app.setLoading(true, 'Đang phân tích cấu trúc STEP...');
                    
                    // Initialize OCCT WebAssembly module
                    const occt = await occtimportjs();
                    
                    // Parse STEP buffer - try with params first, fallback without
                    let result;
                    try {
                        result = occt.ReadStepFile(fileBuffer, { linearDeflection: 0.01, angularDeflection: 0.5 });
                    } catch {
                        result = occt.ReadStepFile(fileBuffer);
                    }
                    
                    if (!result || !result.success) {
                        throw new Error('Đọc file STEP thất bại hoặc dữ liệu bị hỏng.');
                    }

                    this.app.setLoading(true, 'Đang dựng hình lắp ráp...');
                    this.app.progressiveActive = true;

                    const rootGroup = new THREE.Group();
                    rootGroup.name = file.name || "STEP_Assembly";

                    // 1. Tính toán trước Bounding Box tổng thể từ danh sách toạ độ thô của OCCT
                    const globalBox = new THREE.Box3();
                    result.meshes.forEach((occtMesh) => {
                        if (occtMesh.attributes.position && occtMesh.attributes.position.array) {
                            const arr = occtMesh.attributes.position.array;
                            for (let i = 0; i < arr.length; i += 3) {
                                globalBox.expandByPoint(new THREE.Vector3(arr[i], arr[i+1], arr[i+2]));
                            }
                        }
                    });
                    
                    const center = globalBox.getCenter(new THREE.Vector3());
                    const size = globalBox.getSize(new THREE.Vector3());

                    // Dịch chuyển ngược lại để căn tâm mô hình tại (0,0,0)
                    rootGroup.position.copy(center).multiplyScalar(-1);

                    // Tạo mesh hộp giới hạn tạm thời (tàng hình) để camera fit chính xác ngay lập tức
                    const tempGeo = new THREE.BoxGeometry(size.x || 1, size.y || 1, size.z || 1);
                    tempGeo.translate(center.x, center.y, center.z);
                    const tempMesh = new THREE.Mesh(tempGeo, new THREE.MeshBasicMaterial({ visible: false }));
                    tempMesh.name = "temp_bbox_holder";
                    rootGroup.add(tempMesh);

                    const defaultMaterial = new THREE.MeshStandardMaterial({
                        color: 0xf3f4f6,
                        metalness: 0.15,
                        roughness: 0.45,
                        side: THREE.DoubleSide
                    });

                    // Hàm dựng mesh lẻ từ dữ liệu OCCT
                    const buildMeshFn = (occtMesh, index) => {
                        const group = new THREE.Group();
                        group.name = occtMesh.name || `Component_${index + 1}`;

                        // Create geometry
                        const geometry = new THREE.BufferGeometry();

                        // Set positions
                        if (occtMesh.attributes.position && occtMesh.attributes.position.array) {
                            const posArray = new Float32Array(occtMesh.attributes.position.array);
                            geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
                        }

                        // Set normals
                        if (occtMesh.attributes.normal && occtMesh.attributes.normal.array) {
                            const normArray = new Float32Array(occtMesh.attributes.normal.array);
                            geometry.setAttribute('normal', new THREE.BufferAttribute(normArray, 3));
                        } else {
                            geometry.computeVertexNormals();
                        }

                        // Set indices (faces)
                        if (occtMesh.index && occtMesh.index.array) {
                            const indexArray = new Uint32Array(occtMesh.index.array);
                            geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));
                        }

                        // Set colors if available
                        let meshMat = defaultMaterial;
                        if (occtMesh.color) {
                            meshMat = new THREE.MeshStandardMaterial({
                                color: new THREE.Color(occtMesh.color[0], occtMesh.color[1], occtMesh.color[2]),
                                metalness: 0.15,
                                roughness: 0.45,
                                side: THREE.DoubleSide
                            });
                        }

                        const mesh = new THREE.Mesh(geometry, meshMat);
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        mesh.name = occtMesh.name || `Mesh_${index + 1}`;

                        // Áp dụng tối ưu hóa BVH riêng cho từng mesh ngay khi dựng xong
                        MeshBVHManager.applyBVH(mesh);

                        group.add(mesh);
                        return group;
                    };

                    // Trả về rootGroup ngay để main.js đưa vào scene và căn camera
                    resolve(rootGroup);

                    // Chạy ngầm tiến trình dựng hình lũy tiến
                    import('../utils/progressiveLoader.js').then(async ({ ProgressiveLoader }) => {
                        await ProgressiveLoader.buildProgressively(result.meshes, buildMeshFn, rootGroup, this.app, 6);
                        
                        // Hoàn tất: loại bỏ hộp giới hạn tạm thời
                        rootGroup.remove(tempMesh);
                        tempGeo.dispose();

                        // Áp dụng LOD cho toàn bộ mô hình lắp ráp sau khi nạp xong
                        if (window.lodManager) {
                            window.lodManager.applyLOD(rootGroup);
                        }

                        // Tắt trạng thái nạp lũy tiến
                        this.app.progressiveActive = false;
                        this.app.setLoading(false);

                        // Phát sự kiện để main.js cập nhật cây thư mục và explode
                        if (typeof window !== 'undefined' && window.dispatchEvent) {
                            window.dispatchEvent(new CustomEvent('model-loaded-complete', { detail: { model: rootGroup } }));
                        }
                    });

                } catch (error) {
                    this.app.progressiveActive = false;
                    this.app.setLoading(false);
                    reject(error);
                }
            };

            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total) * 100;
                    this.app.updateLoadingProgress(percent);
                }
            };

            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Loads the occt-import-js helper script dynamically from CDN
     */
    async loadOCCTScript() {
        return new Promise((resolve, reject) => {
            // First look in relative path libs/occt-import-js/occt-import-js.js
            const localScript = document.createElement('script');
            localScript.src = './libs/occt-import-js/occt-import-js.js';
            
            localScript.onload = () => resolve();
            localScript.onerror = () => {
                // Fallback to CDN if local copy not ready
                const cdnScript = document.createElement('script');
                cdnScript.src = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.12/dist/occt-import-js.js';
                cdnScript.onload = () => resolve();
                cdnScript.onerror = (err) => reject(new Error('Không thể tải occt-import-js.js từ thư mục cục bộ hoặc CDN!'));
                document.head.appendChild(cdnScript);
            };
            
            document.head.appendChild(localScript);
        });
    }
}
