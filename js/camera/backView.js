// js/camera/backView.js

export function backView(camera, controls) {

    const target = controls.target.clone();

    const distance = camera.position.distanceTo(target);

    camera.position.set(
        target.x,
        target.y,
        target.z - distance
    );

    camera.up.set(0, 1, 0);

    camera.lookAt(target);

    controls.update();
}