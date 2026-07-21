import * as THREE from 'three';

export class ExplodeTool{

    constructor(scene){

        this.scene = scene;

        this.meshes = [];

        scene.traverse(obj=>{

            if(obj.isMesh){

                obj.userData.origin =
                    obj.position.clone();

                this.meshes.push(
                    obj
                );

            }

        });

    }

    update(value){

        this.meshes.forEach(mesh=>{

            const box =
                new THREE.Box3()
                .setFromObject(mesh);

            const center =
                box.getCenter(
                    new THREE.Vector3()
                );

            const direction =
                center.clone()
                .normalize();

            mesh.position.copy(

                mesh.userData.origin
                .clone()
                .add(
                    direction.multiplyScalar(
                        value
                    )
                )

            );

        });

    }

    rebuild(){

    this.meshes=[];

    this.scene.traverse(obj=>{

        if(obj.isMesh){

            obj.userData.origin =
                obj.position.clone();

            this.meshes.push(obj);

        }

    });

    }
    

}