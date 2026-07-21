import * as THREE from 'three';

const registry = new Map();

export const MaterialPresets = {
    steel:       { name: 'Thép',       color: '#a0a5ad', roughness: 0.3,  metalness: 0.9  },
    aluminum:    { name: 'Nhôm',       color: '#d4d9df', roughness: 0.2,  metalness: 0.7  },
    brass:       { name: 'Đồng thau',  color: '#d4a852', roughness: 0.25, metalness: 0.85 },
    plastic:     { name: 'Nhựa',       color: '#e8e8e8', roughness: 0.6,  metalness: 0.0  },
    copper:      { name: 'Đồng đỏ',    color: '#c7784a', roughness: 0.2,  metalness: 0.95 },
    titanium:    { name: 'Titanium',   color: '#8a9299', roughness: 0.35, metalness: 0.8  }
};

export function registerShape(module) {
    if (!module || !module.metadata || !module.build) return;
    registry.set(module.metadata.id, module);
}

export function getShapeTypes() {
    return Array.from(registry.values()).map(m => ({
        id: m.metadata.id,
        name: m.metadata.name,
        icon: m.metadata.icon || ''
    }));
}

export function getShapeMetadata(shapeId) {
    const mod = registry.get(shapeId);
    return mod ? mod.metadata : null;
}

export function getDefaultParams(shapeId) {
    const meta = getShapeMetadata(shapeId);
    if (!meta) return {};
    const defaults = {};
    meta.params.forEach(p => { defaults[p.key] = p.default; });
    return defaults;
}

export function createMaterial(presetKey) {
    const preset = MaterialPresets[presetKey] || MaterialPresets.steel;
    return new THREE.MeshStandardMaterial({
        color: new THREE.Color(preset.color),
        roughness: preset.roughness,
        metalness: preset.metalness,
        side: THREE.DoubleSide
    });
}

export function build(shapeId, params, materialKey = 'steel') {
    const mod = registry.get(shapeId);
    if (!mod) { console.warn('Unknown shape:', shapeId); return null; }
    const material = createMaterial(materialKey);
    try {
        const group = mod.build(params, material);
        group.name = `parametric_${shapeId}`;
        return group;
    } catch (err) {
        console.error(`Build error ${shapeId}:`, err);
        return null;
    }
}

export async function initShapes() {
    const shapes = [
        './shapes/tubeShape.js',
        './shapes/flangeShape.js',
        './shapes/steppedShaftShape.js',
        './shapes/basePlate.js',
        './shapes/adjusterPadShape.js'
    ];
    for (const path of shapes) {
        try {
            const mod = await import(path);
            registerShape(mod);
        } catch (err) {
            console.warn('Shape load failed:', path, err);
        }
    }
    return registry.size;
}
