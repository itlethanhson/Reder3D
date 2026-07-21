import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const metadata = {
    id: 'basePlate',
    name: 'Đế chữ nhật',
    icon: '🔲',
    params: [
        { key: 'width', label: 'Rộng (X)', type: 'number', min: 10, max: 1000, default: 200, step: 1, unit: 'mm' },
        { key: 'depth', label: 'Sâu (Z)', type: 'number', min: 10, max: 1000, default: 150, step: 1, unit: 'mm' },
        { key: 'height', label: 'Cao (Y)', type: 'number', min: 1, max: 100, default: 15, step: 0.5, unit: 'mm' },
        { key: 'cornerRadius', label: 'Bo góc', type: 'number', min: 0, max: 100, default: 0, step: 1, unit: 'mm' },
        { key: 'holeCount', label: 'Số lỗ', type: 'number', min: 0, max: 8, default: 4, step: 1 },
        { key: 'holeDiameter', label: 'Đường kính lỗ', type: 'number', min: 1, max: 50, default: 10, step: 0.5, unit: 'mm' },
        { key: 'holeOffsetX', label: 'Khoảng cách lỗ mép X', type: 'number', min: 5, max: 200, default: 30, step: 1, unit: 'mm' },
        { key: 'holeOffsetZ', label: 'Khoảng cách lỗ mép Z', type: 'number', min: 5, max: 200, default: 25, step: 1, unit: 'mm' }
    ]
};

function createRoundedRectShape(width, depth, radius) {
    const shape = new THREE.Shape();
    const hw = width / 2;
    const hd = depth / 2;
    const r = Math.min(radius, hw, hd);
    if (r <= 0) {
        shape.moveTo(-hw, -hd);
        shape.lineTo(hw, -hd);
        shape.lineTo(hw, hd);
        shape.lineTo(-hw, hd);
        shape.closePath();
        return shape;
    }
    shape.moveTo(-hw + r, -hd);
    shape.lineTo(hw - r, -hd);
    shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
    shape.lineTo(hw, hd - r);
    shape.quadraticCurveTo(hw, hd, hw - r, hd);
    shape.lineTo(-hw + r, hd);
    shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
    shape.lineTo(-hw, -hd + r);
    shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
    return shape;
}

export function build(params, material) {
    const width = params.width;
    const depth = params.depth;
    const height = params.height;

    // Main plate body
    const shape = createRoundedRectShape(width, depth, params.cornerRadius);
    const extrudeSettings = { depth: height, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 1 };
    const bodyGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeom.translate(0, 0, -height / 2);

    const geometries = [bodyGeom];

    // Mounting holes
    const holeCount = params.holeCount;
    const holeR = params.holeDiameter / 2;

    if (holeCount > 0 && holeR > 0) {
        const hw = width / 2 - params.holeOffsetX;
        const hd = depth / 2 - params.holeOffsetZ;
        const positions = [
            [-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd],
            [0, -hd], [hw, 0], [0, hd], [-hw, 0]
        ];

        for (let i = 0; i < Math.min(holeCount, 8); i++) {
            const [hx, hz] = positions[i];
            const holeGeom = new THREE.CylinderGeometry(holeR, holeR, height + 0.2, 16);
            holeGeom.translate(hx, 0, hz);
            geometries.push(holeGeom);
        }
    }

    const merged = mergeGeometries(geometries, false);
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
