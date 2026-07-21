import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const metadata = {
    id: 'flange',
    name: 'Mặt bích',
    icon: '🔘',
    params: [
        { key: 'outerDiameter', label: 'Đường kính ngoài', type: 'number', min: 10, max: 1000, default: 200, step: 1, unit: 'mm' },
        { key: 'innerDiameter', label: 'Đường kính trong', type: 'number', min: 0, max: 500, default: 50, step: 1, unit: 'mm' },
        { key: 'thickness', label: 'Độ dày', type: 'number', min: 1, max: 100, default: 20, step: 0.5, unit: 'mm' },
        { key: 'boltHoles', label: 'Số lỗ bulong', type: 'number', min: 0, max: 24, default: 4, step: 1 },
        { key: 'boltHoleDiameter', label: 'Đường kính lỗ', type: 'number', min: 1, max: 50, default: 12, step: 0.5, unit: 'mm' },
        { key: 'boltCircleDiameter', label: 'Đường kính BCD', type: 'number', min: 10, max: 900, default: 140, step: 1, unit: 'mm' }
    ]
};

export function build(params, material) {
    const outerR = params.outerDiameter / 2;
    const innerR = params.innerDiameter / 2;
    const thickness = params.thickness;

    // Main flange body: 2D ring shape extruded
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
    if (innerR > 0) {
        const hole = new THREE.Path();
        hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
        shape.holes.push(hole);
    }
    const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 2 };
    const bodyGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeom.translate(0, 0, -thickness / 2);

    const geometries = [bodyGeom];

    // Bolt holes
    const boltCount = params.boltHoles;
    const boltR = params.boltHoleDiameter / 2;
    const bcdR = params.boltCircleDiameter / 2;

    if (boltCount > 0 && boltR > 0 && bcdR > 0 && bcdR < outerR) {
        for (let i = 0; i < boltCount; i++) {
            const angle = (i / boltCount) * Math.PI * 2;
            const x = Math.cos(angle) * bcdR;
            const y = Math.sin(angle) * bcdR;
            const holeGeom = new THREE.CylinderGeometry(boltR, boltR, thickness + 0.2, 16);
            holeGeom.translate(x, y, 0);
            geometries.push(holeGeom);
        }
    }

    // Merge all geometries into one
    const merged = mergeGeometries(geometries, false);
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
}
