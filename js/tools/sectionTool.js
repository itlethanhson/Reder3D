import * as THREE from 'three';

export class SectionTool {

    constructor(scene) {

        this.scene = scene;

        this.axis = 'y';

        this.value = 0;

        this.flipped = false;

        // Clipping plane
        this.plane = new THREE.Plane(
            new THREE.Vector3(0, 1, 0),
            0
        );

        // PlaneHelper to visualize cut
        this.helper = new THREE.PlaneHelper(
            this.plane,
            5,
            0x00d4ff
        );

        this.helper.visible = false;

        this.scene.add(this.helper);

    }

    setAxis(axis) {

        this.axis = axis;

        switch (axis) {

            case 'x':
                this.plane.normal.set(1, 0, 0);
                break;

            case 'y':
                this.plane.normal.set(0, 1, 0);
                break;

            case 'z':
                this.plane.normal.set(0, 0, 1);
                break;

        }

        if (this.flipped) {
            this.plane.normal.negate();
        }

        this.update(this.value);

    }

    flip() {

        this.flipped = !this.flipped;
        this.plane.normal.negate();
        this.update(this.value);

    }

    reset() {

        this.value = 0;
        this.flipped = false;
        this.setAxis(this.axis);

        this.scene.traverse(obj => {
            if (obj.isMesh && obj.material) {
                obj.material.clippingPlanes = [];
                obj.material.needsUpdate = true;
            }
        });

        // Reset slider UI
        const slider = document.getElementById('section-slider');
        if (slider) slider.value = 0;

    }

    showHelper(visible) {

        this.helper.visible = visible;

        // Scale helper to bounding box of scene
        const box = new THREE.Box3().setFromObject(this.scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 1);
        this.helper.size = maxDim * 1.2;

    }

    update(value) {

        this.value = value;

        this.plane.constant = this.flipped ? -value : value;

        this.scene.traverse(obj => {

            if (obj.isMesh && obj.material) {

                // Skip the helper's mesh itself
                if (obj === this.helper) return;

                obj.material.clippingPlanes = [this.plane];
                obj.material.needsUpdate = true;

            }

        });

    }

}