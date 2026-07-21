import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const metadata = {
    id: 'steppedShaft',
    name: 'Trục bậc',
    icon: '⚙️',
    params: [
        { key: 'stepCount', label: 'Số bậc', type: 'number', min: 1, max: 5, default: 3, step: 1 },
        { key: 'diameter1', label: 'Đường kính bậc 1', type: 'number', min: 1, max: 500, default: 60, step: 1, unit: 'mm' },
        { key: 'length1', label: 'Chiều dài bậc 1', type: 'number', min: 1, max: 500, default: 40, step: 1, unit: 'mm' },
        { key: 'chamfer1', label: 'Vát mép bậc 1', type: 'number', min: 0, max: 10, default: 1, step: 0.5, unit: 'mm' },
        { key: 'diameter2', label: 'Đường kính bậc 2', type: 'number', min: 1, max: 500, default: 40, step: 1, unit: 'mm' },
        { key: 'length2', label: 'Chiều dài bậc 2', type: 'number', min: 1, max: 500, default: 50, step: 1, unit: 'mm' },
        { key: 'chamfer2', label: 'Vát mép bậc 2', type: 'number', min: 0, max: 10, default: 1, step: 0.5, unit: 'mm' },
        { key: 'diameter3', label: 'Đường kính bậc 3', type: 'number', min: 1, max: 500, default: 25, step: 1, unit: 'mm' },
        { key: 'length3', label: 'Chiều dài bậc 3', type: 'number', min: 1, max: 500, default: 30, step: 1, unit: 'mm' },
        { key: 'chamfer3', label: 'Vát mép bậc 3', type: 'number', min: 0, max: 10, default: 1, step: 0.5, unit: 'mm' },
        { key: 'diameter4', label: 'Đường kính bậc 4', type: 'number', min: 1, max: 500, default: 20, step: 1, unit: 'mm' },
        { key: 'length4', label: 'Chiều dài bậc 4', type: 'number', min: 1, max: 500, default: 25, step: 1, unit: 'mm' },
        { key: 'chamfer4', label: 'Vát mép bậc 4', type: 'number', min: 0, max: 10, default: 0.5, step: 0.5, unit: 'mm' },
        { key: 'diameter5', label: 'Đường kính bậc 5', type: 'number', min: 1, max: 500, default: 15, step: 1, unit: 'mm' },
        { key: 'length5', label: 'Chiều dài bậc 5', type: 'number', min: 1, max: 500, default: 20, step: 1, unit: 'mm' },
        { key: 'chamfer5', label: 'Vát mép bậc 5', type: 'number', min: 0, max: 10, default: 0, step: 0.5, unit: 'mm' }
    ]
};

export function build(params, material) {
    const count = params.stepCount;
    const geometries = [];
    let cumulativeY = 0;

    for (let i = 1; i <= count; i++) {
        const dia = params[`diameter${i}`] || 10;
        const len = params[`length${i}`] || 20;
        const chamfer = params[`chamfer${i}`] || 0;

        const radius = dia / 2;
        const halfLen = len / 2;

        // Main cylinder
        const geom = new THREE.CylinderGeometry(radius, radius, len, 32);
        geom.translate(0, cumulativeY + halfLen, 0);
        geometries.push(geom);

        // Chamfer at top edge
        if (chamfer > 0 && i < count) {
            const nextDia = params[`diameter${i + 1}`] || dia;
            if (nextDia < dia) {
                const chamferGeom = new THREE.CylinderGeometry(radius, nextDia / 2, chamfer, 32);
                chamferGeom.translate(0, cumulativeY + len - chamfer / 2, 0);
                geometries.push(chamferGeom);
            }
        }

        cumulativeY += len;
    }

    // Center vertically
    const offsetY = -cumulativeY / 2;
    geometries.forEach(g => g.translate(0, offsetY, 0));

    const merged = mergeGeometries(geometries, false);
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
