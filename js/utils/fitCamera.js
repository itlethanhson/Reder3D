import * as THREE from 'three';

export function fitCameraToObject(
    camera,
    controls,
    object,
    offset = 1.5
) {

    const box =
        new THREE.Box3()
            .setFromObject(
                object
            );

    const center =
        box.getCenter(
            new THREE.Vector3()
        );

    const size =
        box.getSize(
            new THREE.Vector3()
        );

    const maxDim =
        Math.max(
            size.x,
            size.y,
            size.z
        );

    const fov =
        camera.fov *
        Math.PI / 180;

    let distance =
        maxDim /
        (2 * Math.tan(
            fov / 2
        ));

    distance *= offset;

    camera.position.set(
        center.x + distance,
        center.y + distance,
        center.z + distance
    );

    controls.target.copy(
        center
    );

    controls.update();

}