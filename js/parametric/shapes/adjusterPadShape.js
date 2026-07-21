import * as THREE from 'three';

export const metadata = {
    id: 'adjusterPad',
    name: 'Đệm Điều Chỉnh',
    icon: '🔧',
    params: [
        { key: 'threadDiameter', label: 'Đường kính ren (M)', type: 'number', min: 6, max: 30, default: 12, step: 1, unit: 'mm' },
        { key: 'screwLength',     label: 'Chiều dài vít (L)',  type: 'number', min: 30, max: 300, default: 100, step: 1, unit: 'mm' },
        { key: 'padDiameter',     label: 'Đường kính đế (D)',  type: 'number', min: 20, max: 150, default: 60, step: 1, unit: 'mm' },
        { key: 'padThickness',    label: 'Độ dày đế (E)',      type: 'number', min: 5,  max: 30,  default: 12, step: 0.5, unit: 'mm' }
    ]
};

export function build(params, material) {
    const threadR = params.threadDiameter / 2;
    const screwLen = params.screwLength;
    const padR = params.padDiameter / 2;
    const padThick = params.padThickness;

    const group = new THREE.Group();

    // ── Threaded shaft (cylinder, centered) ──
    const shaftGeom = new THREE.CylinderGeometry(threadR, threadR, screwLen, 32);
    const shaft = new THREE.Mesh(shaftGeom, material);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);

    // ── Pad base (cylinder, below shaft) ──
    const padGeom = new THREE.CylinderGeometry(padR, padR, padThick, 32);
    const pad = new THREE.Mesh(padGeom, material);
    pad.position.y = -(screwLen / 2 + padThick / 2);
    pad.castShadow = true;
    pad.receiveShadow = true;
    group.add(pad);

    return group;
}
