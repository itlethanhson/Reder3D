import * as THREE from 'three';

import {
    raycaster,
    mouse
}
from '../core/raycasterManager.js';

import {
    createDistanceLabel
}
from '../utils/labelManager.js';

export class MeasureTool{

    constructor(
        scene,
        camera
    ){

        this.scene = scene;

        this.camera = camera;

        this.points = [];

        this.enabled = false;

        this.measurements = []; // Track created lines and labels

        window.addEventListener(
            "pointerdown",
            this.onClick.bind(this)
        );

    }

    enable(){

        this.enabled = true;

    }

    disable(){

        this.enabled = false;

        this.points = [];

    }

    clear(){
        this.measurements.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        this.measurements = [];
        this.points = [];
    }

    onClick(
        event
    ){

        if(
            !this.enabled
        ) return;

        mouse.x =
        (event.clientX/window.innerWidth)
        *2-1;

        mouse.y =
        -(event.clientY/window.innerHeight)
        *2+1;

        raycaster.setFromCamera(
            mouse,
            this.camera
        );

        const intersects =
            raycaster.intersectObjects(
                this.scene.children,
                true
            );

        if(
            intersects.length
        ){

            this.points.push(
                intersects[0].point.clone()
            );

        }

        if(
            this.points.length===2
        ){

            this.createLine();

            this.points=[];

        }

    }

    createLine(){

        const p1 =
            this.points[0];

        const p2 =
            this.points[1];

        const geometry =
            new THREE.BufferGeometry()
            .setFromPoints(
                [p1,p2]
            );

        const material =
            new THREE.LineBasicMaterial({
                color:0x00ff00
            });

        const line =
            new THREE.Line(
                geometry,
                material
            );

        this.scene.add(
            line
        );

        const label = createDistanceLabel(
            p1,
            p2
        );
        this.scene.add(label);

        this.measurements.push(line, label);

    }

}