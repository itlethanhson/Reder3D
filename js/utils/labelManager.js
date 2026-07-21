import {
CSS2DObject
}
from 'three/addons/renderers/CSS2DRenderer.js';

import * as THREE from 'three';

export function createDistanceLabel(
    p1,
    p2
){

    const distance =
        p1.distanceTo(
            p2
        );

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "measure-label";

    div.innerHTML =
        distance.toFixed(2);

    const label =
        new CSS2DObject(
            div
        );

    label.position.copy(

        new THREE.Vector3(

            (p1.x+p2.x)/2,

            (p1.y+p2.y)/2,

            (p1.z+p2.z)/2

        )

    );

    return label;

}