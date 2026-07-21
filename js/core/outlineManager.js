import * as THREE from 'three';

import { OutlinePass }
from 'three/addons/postprocessing/OutlinePass.js';


export function createOutlinePass(
    composer,
    scene,
    camera
){

    const outlinePass =
        new OutlinePass(
            new THREE.Vector2(
                window.innerWidth,
                window.innerHeight
            ),
            scene,
            camera
        );

    outlinePass.edgeStrength = 6;

    outlinePass.edgeGlow = 0;

    outlinePass.edgeThickness = 2;

    outlinePass.visibleEdgeColor
        .set(
            0x00aaff
        );

    composer.addPass(
        outlinePass
    );

    return outlinePass;

}