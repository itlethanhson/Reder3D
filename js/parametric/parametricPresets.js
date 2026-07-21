import { MaterialPresets, getDefaultParams } from './parametricBuilder.js';

export const Presets = [
    {
        id: 'uni1902_style',
        name: 'UNI-1902 Style',
        shapeId: 'tube',
        material: 'steel',
        params: { outerDiameter: 50, innerDiameter: 20, length: 80, radialSegments: 32 }
    },
    {
        id: 'flange_dn100',
        name: 'Mặt bích DN100',
        shapeId: 'flange',
        material: 'steel',
        params: { outerDiameter: 220, innerDiameter: 100, thickness: 24, boltHoles: 8, boltHoleDiameter: 18, boltCircleDiameter: 180 }
    },
    {
        id: 'flange_dn50',
        name: 'Mặt bích DN50',
        shapeId: 'flange',
        material: 'brass',
        params: { outerDiameter: 165, innerDiameter: 50, thickness: 20, boltHoles: 4, boltHoleDiameter: 14, boltCircleDiameter: 125 }
    },
    {
        id: 'shaft_3step',
        name: 'Trục 3 bậc',
        shapeId: 'steppedShaft',
        material: 'steel',
        params: { stepCount: 3, diameter1: 60, length1: 40, chamfer1: 1, diameter2: 40, length2: 50, chamfer2: 1, diameter3: 25, length3: 30, chamfer3: 1, diameter4: 20, length4: 25, chamfer4: 0, diameter5: 15, length5: 20, chamfer5: 0 }
    },
    {
        id: 'shaft_5step',
        name: 'Trục 5 bậc',
        shapeId: 'steppedShaft',
        material: 'titanium',
        params: { stepCount: 5, diameter1: 80, length1: 30, chamfer1: 2, diameter2: 60, length2: 35, chamfer2: 1, diameter3: 45, length3: 40, chamfer3: 1, diameter4: 30, length4: 25, chamfer4: 0.5, diameter5: 20, length5: 30, chamfer5: 0 }
    },
    {
        id: 'plate_200x150',
        name: 'Đế 200x150',
        shapeId: 'basePlate',
        material: 'aluminum',
        params: { width: 200, depth: 150, height: 15, cornerRadius: 10, holeCount: 4, holeDiameter: 10, holeOffsetX: 30, holeOffsetZ: 25 }
    },
    {
        id: 'plate_300x200',
        name: 'Đế 300x200',
        shapeId: 'basePlate',
        material: 'steel',
        params: { width: 300, depth: 200, height: 20, cornerRadius: 0, holeCount: 6, holeDiameter: 12, holeOffsetX: 40, holeOffsetZ: 35 }
    },
    {
        id: 'pipe_100x80',
        name: 'Ống Ø100 dày 10',
        shapeId: 'tube',
        material: 'plastic',
        params: { outerDiameter: 100, innerDiameter: 80, length: 150, radialSegments: 32 }
    },
    {
        id: 'adjuster_ser11_m10',
        name: 'SER11 M10×100',
        shapeId: 'adjusterPad',
        material: 'steel',
        params: { threadDiameter: 10, screwLength: 100, padDiameter: 38, padThickness: 12 }
    },
    {
        id: 'adjuster_ser11_m12',
        name: 'SER11 M12×150',
        shapeId: 'adjusterPad',
        material: 'steel',
        params: { threadDiameter: 12, screwLength: 150, padDiameter: 60, padThickness: 15 }
    },
    {
        id: 'adjuster_ser11_m16',
        name: 'SER11 M16×200',
        shapeId: 'adjusterPad',
        material: 'steel',
        params: { threadDiameter: 16, screwLength: 200, padDiameter: 75, padThickness: 18 }
    },
    {
        id: 'adjuster_ser11_m20',
        name: 'SER11 M20×200',
        shapeId: 'adjusterPad',
        material: 'titanium',
        params: { threadDiameter: 20, screwLength: 200, padDiameter: 75, padThickness: 20 }
    }
];

/**
 * @returns {Array} list of preset objects
 */
export function getPresets() {
    return Presets;
}

/**
 * Get full preset data (fills missing params with defaults)
 */
export function getPresetData(presetId) {
    const preset = Presets.find(p => p.id === presetId);
    if (!preset) return null;
    const defaults = getDefaultParams(preset.shapeId);
    return {
        ...preset,
        params: { ...defaults, ...preset.params }
    };
}
