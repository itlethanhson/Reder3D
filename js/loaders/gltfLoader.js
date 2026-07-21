import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { MeshBVHManager } from '../utils/meshBVHManager.js';

export class GLTFLoaderWrapper {
    constructor(app) {
        this.app = app;
        this.loader = new GLTFLoader();
        this._companionFiles = null;
    }

    /**
     * Loads a GLTF/GLB file object
     * @param {File|string} fileOrUrl - File object or URL string
     * @param {FileList} [companionFiles] - all files selected (for .gltf external deps)
     * @returns {Promise<THREE.Group>}
     */
    async load(fileOrUrl, companionFiles) {
        if (companionFiles) {
            this._companionFiles = companionFiles;
        }

        if (typeof fileOrUrl === 'string') {
            return this._loadFromUrl(fileOrUrl);
        }

        const isGLTF = fileOrUrl.name.toLowerCase().endsWith('.gltf');

        if (isGLTF) {
            return this._loadGLTF(fileOrUrl);
        }

        return this._loadGLB(fileOrUrl);
    }

    _processModel(model, fileName) {
        model.name = fileName || "GLTF_Model";

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;

                if (node.material) {
                    node.material.side = THREE.DoubleSide;
                }
            }
        });

        MeshBVHManager.applyBVH(model);
    }

    _loadGLB(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            this.loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    this._processModel(model, file.name);
                    URL.revokeObjectURL(url);

                    resolve(model);

                    this.app.progressiveActive = true;
                    import('../utils/progressiveLoader.js').then(async ({ ProgressiveLoader }) => {
                        await ProgressiveLoader.revealProgressively(model, this.app, 12);

                        if (window.lodManager) {
                            window.lodManager.applyLOD(model);
                        }

                        this.app.progressiveActive = false;
                        this.app.setLoading(false);

                        if (typeof window !== 'undefined' && window.dispatchEvent) {
                            window.dispatchEvent(new CustomEvent('model-loaded-complete', { detail: { model } }));
                        }
                    });
                },
                null,
                (error) => {
                    URL.revokeObjectURL(url);
                    reject(error);
                }
            );
        });
    }

    async _loadGLTF(file) {
        // Đọc file .gltf text để kiểm tra external dependencies
        const text = await file.text();
        let json;

        try {
            json = JSON.parse(text);
        } catch (e) {
            throw new Error('Invalid GLTF JSON: ' + e.message);
        }

        // Embed external buffers (file .bin) và textures từ companion files
        await this._embedExternalResources(json);

        // Kiểm tra còn URI chưa được resolve
        const unresolved = [];
        for (const buf of (json.buffers || [])) {
            if (buf.uri && !buf.uri.startsWith('data:')) unresolved.push(buf.uri);
        }
        for (const img of (json.images || [])) {
            if (img.uri && !img.uri.startsWith('data:')) unresolved.push(img.uri);
        }
        if (unresolved.length > 0) {
            throw new Error(
                'File .gltf cần các file đi kèm nhưng không tìm thấy.\n' +
                'Thiếu: ' + unresolved.join(', ') + '\n' +
                'Vui lòng chọn ĐỒNG THỜI tất cả file (.gltf + .bin + textures) trong hộp thoại Open.'
            );
        }

        // Convert JSON -> ArrayBuffer -> parse
        const encoded = new TextEncoder().encode(JSON.stringify(json));

        return new Promise((resolve, reject) => {
            this.loader.parse(
                encoded.buffer,
                '',
                (gltf) => {
                    const model = gltf.scene;
                    this._processModel(model, file.name);

                    resolve(model);

                    this.app.progressiveActive = true;
                    import('../utils/progressiveLoader.js').then(async ({ ProgressiveLoader }) => {
                        await ProgressiveLoader.revealProgressively(model, this.app, 12);

                        if (window.lodManager) {
                            window.lodManager.applyLOD(model);
                        }

                        this.app.progressiveActive = false;
                        this.app.setLoading(false);

                        if (typeof window !== 'undefined' && window.dispatchEvent) {
                            window.dispatchEvent(new CustomEvent('model-loaded-complete', { detail: { model } }));
                        }
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    async _embedExternalResources(json) {
        const companionMap = new Map();
        if (this._companionFiles) {
            for (const f of this._companionFiles) {
                companionMap.set(f.name.toLowerCase(), f);
            }
        }

        // Embed external .bin buffers
        const buffers = json.buffers || [];
        for (const buf of buffers) {
            if (buf.uri && !buf.uri.startsWith('data:')) {
                const fileName = buf.uri.split(/[\\/]/).pop().split('?')[0];
                const companion = companionMap.get(fileName.toLowerCase());
                if (companion) {
                    const ab = await companion.arrayBuffer();
                    const base64 = _arrayBufferToBase64(ab);
                    buf.uri = `data:application/octet-stream;base64,${base64}`;
                }
            }
        }

        // Embed external textures
        const images = json.images || [];
        for (const img of images) {
            if (img.uri && !img.uri.startsWith('data:')) {
                const fileName = img.uri.split(/[\\/]/).pop().split('?')[0];
                const companion = companionMap.get(fileName.toLowerCase());
                if (companion) {
                    const mime = _mimeFromExt(fileName);
                    const ab = await companion.arrayBuffer();
                    const base64 = _arrayBufferToBase64(ab);
                    img.uri = `data:${mime};base64,${base64}`;
                }
            }
        }
    }

    _loadFromUrl(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    const fileName = url.substring(url.lastIndexOf('/') + 1);
                    this._processModel(model, fileName);

                    resolve(model);

                    this.app.progressiveActive = true;
                    import('../utils/progressiveLoader.js').then(async ({ ProgressiveLoader }) => {
                        await ProgressiveLoader.revealProgressively(model, this.app, 12);

                        if (window.lodManager) {
                            window.lodManager.applyLOD(model);
                        }

                        this.app.progressiveActive = false;
                        this.app.setLoading(false);

                        if (typeof window !== 'undefined' && window.dispatchEvent) {
                            window.dispatchEvent(new CustomEvent('model-loaded-complete', { detail: { model } }));
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
                    reject(error);
                }
            );
        });
    }
}

function _mimeFromExt(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const map = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        bmp: 'image/bmp',
        ktx2: 'image/ktx2',
    };
    return map[ext] || 'application/octet-stream';
}

function _arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const CHUNK = 8192;
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
}
