import { EffectComposer }
from 'three/addons/postprocessing/EffectComposer.js';

import { RenderPass }
from 'three/addons/postprocessing/RenderPass.js';


export function createComposer(
    renderer,
    scene,
    camera
){

    const composer =
        new EffectComposer(
            renderer
        );

    const renderPass =
        new RenderPass(
            scene,
            camera
        );

    composer.addPass(
        renderPass
    );

    return composer;

}