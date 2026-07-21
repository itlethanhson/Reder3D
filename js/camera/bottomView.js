// js/camera/bottomView.js

export function bottomView(camera, controls) {

    const target = controls.target.clone();

    const distance = camera.position.distanceTo(target);

    camera.position.set(
        target.x,
        target.y - distance,
        target.z
    );

    camera.up.set(0, 0, 1);

    camera.lookAt(target);

    controls.update();
}