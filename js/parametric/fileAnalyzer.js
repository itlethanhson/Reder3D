/**
 * Phân tích file 3D (STEP/GLB/STL) để trích xuất thông số hình học.
 * Trả về profile object chứa shape type và params ước tính.
 */
import * as THREE from 'three';

/**
 * @param {File} file
 * @returns {Promise<object>} { name, shapeId, material, params, bbox }
 */
export async function analyzeFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'stp' || ext === 'step') {
        return analyzeSTEP(file);
    }
    if (ext === 'glb' || ext === 'gltf') {
        return analyzeGLB(file);
    }
    if (ext === 'stl') {
        return analyzeSTL(file);
    }

    throw new Error('Định dạng không hỗ trợ: .' + ext);
}

// ─── STEP ────────────────────────────────────────────

async function analyzeSTEP(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const buffer = new Uint8Array(reader.result);

                // Ensure occtimportjs loaded
                if (typeof occtimportjs === 'undefined') {
                    await loadOCCT();
                }
                const occt = await occtimportjs();

                let result;
                try {
                    result = occt.ReadStepFile(buffer, { linearDeflection: 0.01, angularDeflection: 0.5 });
                } catch {
                    result = occt.ReadStepFile(buffer);
                }

                if (!result || !result.meshes) {
                    throw new Error('Không parse được STEP');
                }

                const profile = analyzeMeshArray(result.meshes, file.name);
                resolve(profile);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = () => reject(new Error('Đọc file thất bại'));
        reader.readAsArrayBuffer(file);
    });
}

// ─── GLB / GLTF ──────────────────────────────────────

async function analyzeGLB(file) {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const loader = new GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                URL.revokeObjectURL(url);
                const meshes = [];
                gltf.scene.traverse(n => {
                    if (n.isMesh) {
                        meshes.push({
                            name: n.name || 'mesh',
                            geometry: n.geometry,
                            position: n.position
                        });
                    }
                });
                const profile = analyzeThreeMeshes(meshes, file.name);
                resolve(profile);
            },
            null,
            (err) => {
                URL.revokeObjectURL(url);
                reject(err);
            }
        );
    });
}

// ─── STL ─────────────────────────────────────────────

async function analyzeSTL(file) {
    const { STLLoader } = await import('three/addons/loaders/STLLoader.js');
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const loader = new STLLoader();
        loader.load(
            url,
            (geometry) => {
                URL.revokeObjectURL(url);
                const meshes = [{ name: 'stl_mesh', geometry }];
                const profile = analyzeThreeMeshes(meshes, file.name);
                resolve(profile);
            },
            null,
            (err) => {
                URL.revokeObjectURL(url);
                reject(err);
            }
        );
    });
}

// ─── Core Analysis ───────────────────────────────────

function analyzeMeshArray(occtMeshes, fileName) {
    const boxes = [];

    for (const m of occtMeshes) {
        if (m.attributes && m.attributes.position && m.attributes.position.array) {
            const arr = m.attributes.position.array;
            const box = new THREE.Box3();
            for (let i = 0; i < arr.length; i += 3) {
                box.expandByPoint(new THREE.Vector3(arr[i], arr[i + 1], arr[i + 2]));
            }
            boxes.push({ name: m.name, box });
        }
    }

    return classifyShape(boxes, fileName);
}

function analyzeThreeMeshes(meshes, fileName) {
    const boxes = [];
    for (const m of meshes) {
        if (m.geometry) {
            m.geometry.computeBoundingBox();
            boxes.push({ name: m.name, box: m.geometry.boundingBox.clone() });
        }
    }
    return classifyShape(boxes, fileName);
}

function classifyShape(boxes, fileName) {
    if (boxes.length === 0) {
        return { name: fileName, shapeId: 'tube', material: 'steel', params: {}, bbox: null };
    }

    // ── Filename-based detection for known part series ──
    const upperName = fileName.toUpperCase();
    const isAdjusterPad = /^(SER\d+|C-CNFJN|C-CFJSN|NFJNF|CNFJN)/i.test(fileName);
    if (isAdjusterPad && boxes.length >= 1) {
        const totalBox = new THREE.Box3();
        boxes.forEach(b => totalBox.union(b.box));
        const size = new THREE.Vector3();
        totalBox.getSize(size);
        const dims = [size.x, size.y, size.z].sort((a, b) => a - b);
        const short = dims[0];
        const mid = dims[1];
        const long = dims[2];

        return {
            name: fileName,
            shapeId: 'adjusterPad',
            material: 'steel',
            params: {
                threadDiameter: Math.round(mid),
                screwLength: Math.round(long),
                padDiameter: Math.round(Math.max(mid * 4, 38)),
                padThickness: Math.round(short * 2) / 2 || 12
            },
            bbox: {
                width: +size.x.toFixed(1), height: +size.y.toFixed(1), depth: +size.z.toFixed(1),
                centerX: 0, centerY: 0, centerZ: 0
            }
        };
    }

    // Merge all boxes
    const totalBox = new THREE.Box3();
    boxes.forEach(b => totalBox.union(b.box));

    const size = new THREE.Vector3();
    totalBox.getSize(size);
    const center = new THREE.Vector3();
    totalBox.getCenter(center);

    const bbox = {
        width: +size.x.toFixed(1),
        height: +size.y.toFixed(1),
        depth: +size.z.toFixed(1),
        centerX: +center.x.toFixed(1),
        centerY: +center.y.toFixed(1),
        centerZ: +center.z.toFixed(1)
    };

    // ─── Axis-agnostic classification ───
    // Sort dimensions: short < mid < long
    const dims = [
        { val: +size.x.toFixed(3), axis: 'x' },
        { val: +size.y.toFixed(3), axis: 'y' },
        { val: +size.z.toFixed(3), axis: 'z' }
    ].sort((a, b) => a.val - b.val);
    const short = dims[0].val;
    const mid   = dims[1].val;
    const long  = dims[2].val;
    const longAxis  = dims[2].axis;

    const maxDim = long;
    const minDim = short;

    // ── Adjuster Pad: composite part with base + shaft from multiple meshes ──
    if (boxes.length >= 2) {
        // Check if we have a narrow long cylinder + wide short cylinder
        const boxesBySize = boxes.map(b => {
            const s = new THREE.Vector3();
            b.box.getSize(s);
            return { box: b.box, size: s, maxDim: Math.max(s.x, s.y, s.z), minDim: Math.min(s.x, s.y, s.z) };
        }).sort((a, b) => a.maxDim - b.maxDim);

        const smallBox = boxesBySize[0];
        const largeBox = boxesBySize[boxesBySize.length - 1];

        // Large part is wide+flat, small part is long+narrow → adjuster pad
        if (smallBox.maxDim > largeBox.maxDim * 0.7) {
            // Parts are similar in size - skip
        } else if (largeBox.size.y < largeBox.size.x * 0.5 || largeBox.size.y < largeBox.size.z * 0.5) {
            // Large part is flat (pad base), small part is the shaft
            // Verify small part is cylindrical (cross-section similar, not flat)
            const smallSorted = [smallBox.size.x, smallBox.size.y, smallBox.size.z].sort((a, b) => a - b);
            if (smallSorted[0] > smallSorted[2] * 0.5 && smallSorted[2] > smallSorted[1] * 1.5) {
                // Cylindrical shaft detected
                const padDiam = Math.max(largeBox.size.x, largeBox.size.z);
                const padThick = largeBox.size.y;
                const threadDiam = Math.round(Math.max(smallBox.minDim, smallBox.size.x, smallBox.size.y, smallBox.size.z) * 0.8);
                const screwLen = Math.round(smallBox.maxDim);

                return {
                    name: fileName,
                    shapeId: 'adjusterPad',
                    material: 'steel',
                    params: {
                        threadDiameter: Math.max(6, Math.min(30, threadDiam)),
                        screwLength: Math.max(30, Math.min(300, screwLen)),
                        padDiameter: Math.round(padDiam),
                        padThickness: Math.round(padThick * 2) / 2
                    },
                    bbox
                };
            }
        }
    }

    // ── Flat (Flange / BasePlate): one dimension << the other two ──
    const isFlat = short < mid * 0.35;
    if (isFlat && boxes.length >= 2) {
        // Likely a flange — estimate bolt holes from small sub-parts
        let bcd = 0, boltCount = 0;
        const smallBoxes = boxes.filter(b => {
            const s = new THREE.Vector3();
            b.box.getSize(s);
            return Math.max(s.x, s.y, s.z) < maxDim * 0.25;
        });
        if (smallBoxes.length >= 4) {
            boltCount = smallBoxes.length;
            let sumDist = 0;
            for (const sb of smallBoxes) {
                const sc = new THREE.Vector3();
                sb.box.getCenter(sc);
                sumDist += Math.sqrt(sc.x * sc.x + sc.y * sc.y + sc.z * sc.z);
            }
            bcd = Math.round(((sumDist / boltCount) * 2) * 2) / 2;
        }

        return {
            name: fileName,
            shapeId: 'flange',
            material: 'steel',
            params: {
                outerDiameter: Math.round(Math.max(size.x, size.y)),
                innerDiameter: Math.round(Math.min(size.x, size.y) * 0.4),
                thickness: Math.round(short * 2) / 2,
                boltHoles: boltCount || 4,
                boltHoleDiameter: Math.round(minDim * 0.3),
                boltCircleDiameter: bcd || Math.round(Math.max(size.x, size.y) * 0.7)
            },
            bbox
        };
    }

    // ── Cylindrical (SteppedShaft / Tube): short ≈ mid, both << long ──
    // Two similar cross-section dims and one much longer axis
    const crossSectionSimilar = Math.abs(short - mid) < long * 0.15;
    const isElongated = long > mid * 1.3;

    if (crossSectionSimilar && isElongated) {
        // Stepped shaft: long > 2× cross-section
        if (long > mid * 2.0) {
            return {
                name: fileName,
                shapeId: 'steppedShaft',
                material: 'steel',
                params: {
                    stepCount: 1,
                    diameter1: Math.round(mid),
                    length1: Math.round(long),
                    chamfer1: Math.max(1, Math.round(mid * 0.1))
                },
                bbox
            };
        }
        // Shorter cylinder → tube
        return {
            name: fileName,
            shapeId: 'tube',
            material: 'steel',
            params: {
                outerDiameter: Math.round(mid),
                innerDiameter: Math.round(mid * 0.6),
                length: Math.round(long),
                radialSegments: 32
            },
            bbox
        };
    }

    // ── Cross-section similar but not elongated → tube (squat cylinder) ──
    if (crossSectionSimilar) {
        return {
            name: fileName,
            shapeId: 'tube',
            material: 'steel',
            params: {
                outerDiameter: Math.round(mid),
                innerDiameter: Math.round(mid * 0.6),
                length: Math.round(long),
                radialSegments: 32
            },
            bbox
        };
    }

    // ── Flat with single part → basePlate ──
    if (isFlat) {
        return {
            name: fileName,
            shapeId: 'basePlate',
            material: 'steel',
            params: {
                width: Math.round(size.x),
                depth: Math.round(size.y),
                height: Math.round(size.z),
                cornerRadius: Math.round(Math.min(size.x, size.y) * 0.05),
                holeCount: 0,
                holeDiameter: 5,
                holeOffsetX: Math.round(size.x * 0.15),
                holeOffsetZ: Math.round(size.y * 0.15)
            },
            bbox
        };
    }

    // ── Default: basePlate ──
    return {
        name: fileName,
        shapeId: 'basePlate',
        material: 'steel',
        params: {
            width: Math.round(size.x),
            depth: Math.round(size.y),
            height: Math.round(size.z),
            cornerRadius: Math.round(Math.min(size.x, size.y) * 0.05),
            holeCount: 0,
            holeDiameter: 5,
            holeOffsetX: Math.round(size.x * 0.15),
            holeOffsetZ: Math.round(size.y * 0.15)
        },
        bbox
    };
}

// ─── Extract from loaded Three.js Group ──────────────

/**
 * Trích xuất profile từ một Three.js Group đã được load (GLB/STEP/STL).
 * Không cần parse lại file — dùng trực tiếp geometry trong scene.
 * @param {THREE.Group} group - Model đã load vào scene
 * @param {string} fileName - Tên file gốc
 * @returns {object} Profile object { name, shapeId, material, params, bbox }
 */
export function extractProfileFromModel(group, fileName) {
    const boxes = [];
    group.traverse(node => {
        if (node.isMesh && node.geometry) {
            const box = new THREE.Box3().setFromObject(node);
            if (!box.isEmpty()) {
                boxes.push({ name: node.name, box });
            }
        }
    });
    return classifyShape(boxes, fileName);
}

// ─── OCCT loader ─────────────────────────────────────

async function loadOCCT() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.12/dist/occt-import-js.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Không tải được occt-import-js'));
        document.head.appendChild(script);
    });
}
