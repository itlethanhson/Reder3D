import {
    raycaster,
    mouse
}
from '../core/raycasterManager.js';


export class SelectionTool{

    constructor(
        scene,
        camera
    ){

        this.scene=scene;

        this.camera=camera;

        this.selected=null;

        this.callback=null;
        this.onDeselectCallback = null;

        window.addEventListener(
            "pointerdown",
            this.onPointerDown.bind(this)
        );

    }

    onPointerDown(
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

        if(intersects.length > 0){

            this.selected = intersects[0].object;

            if(this.callback){

                this.callback(this.selected);

            }

        }
        else{

            this.selected = null;

            if(this.onDeselectCallback){

                this.onDeselectCallback();

            }

        }

    }

    setOnSelect(
        callback
    ){

        this.callback =
            callback;

    }

    setOnDeselect(callback){

        this.onDeselectCallback = callback;

    }

}