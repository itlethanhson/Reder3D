import {
    raycaster,
    mouse
}
from '../core/raycasterManager.js';


export class HoverTool{

    constructor(
        scene,
        camera,
        outlinePass
    ){

        this.scene = scene;

        this.camera = camera;

        this.outlinePass = outlinePass;

        window.addEventListener(
            "pointermove",
            this.onPointerMove
            .bind(this)
        );

    }

    onPointerMove(
        event
    ){

        mouse.x =
            (event.clientX /
            window.innerWidth)
            *2-1;

        mouse.y =
            -(event.clientY /
            window.innerHeight)
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

            this.outlinePass.selectedObjects =
            [
                intersects[0].object
            ];

        }else{

            this.outlinePass.selectedObjects=[];

        }

    }

}