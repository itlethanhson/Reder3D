import * as THREE from 'three';

export const metadata = {
    id: 'tube',
    name: 'Ống tròn',
    icon: '🔩',
    params: [
        { key: 'outerDiameter', label: 'Đường kính ngoài', type: 'number', min: 1, max: 500, default: 50, step: 1, unit: 'mm' },
        { key: 'innerDiameter', label: 'Đường kính trong', type: 'number', min: 0, max: 500, default: 30, step: 1, unit: 'mm' },
        { key: 'length', label: 'Chiều dài', type: 'number', min: 1, max: 2000, default: 100, step: 1, unit: 'mm' },
        { key: 'radialSegments', label: 'Độ mịn', type: 'number', min: 8, max: 64, default: 32, step: 8 }
    ]
};

export function build(params, material) {
    const outerR = params.outerDiameter / 2;
    const innerR = params.innerDiameter / 2;
    const length = params.length;
    const segments = params.radialSegments;
    let geom;

    if (innerR > 0 && innerR < outerR) {
        const halfLen = length / 2;
        const points = [];
        const segs = 4;
        for (let i = 0; i <= segs; i++) {
            const y = -halfLen + (length * i / segs);
            points.push(new THREE.Vector2(outerR, y));
        }
        points.push(new THREE.Vector2(innerR, halfLen));
        for (let i = segs; i >= 0; i--) {
            const y = -halfLen + (length * i / segs);
            points.push(new THREE.Vector2(innerR, y));
        }
        points.push(new THREE.Vector2(outerR, -halfLen));
        geom = new THREE.LatheGeometry(points, segments);
    } else {
        geom = new THREE.CylinderGeometry(outerR, outerR, length, segments);
    }

    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
