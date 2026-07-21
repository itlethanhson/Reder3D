import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createControls(camera, renderer) {

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = true;

    controls.minDistance = 0.1;

    controls.maxDistance = 5000;

    controls.autoRotate = false;

    return controls;

}