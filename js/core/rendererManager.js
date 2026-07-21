import * as THREE from 'three';
import { agentLog } from '../utils/agentLog.js';

export function createRenderer() {

    const renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            preserveDrawingBuffer: true

        });

    renderer.setPixelRatio(
        window.devicePixelRatio
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled =
        true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.5;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.localClippingEnabled = true;

    // #region agent log
    agentLog('rendererManager.js:38', 'renderer color config', { toneMapping: renderer.toneMapping, toneMappingExposure: renderer.toneMappingExposure, outputColorSpace: renderer.outputColorSpace, shadowMapEnabled: renderer.shadowMap.enabled }, 'C');
    // #endregion

    document
        .getElementById(
            "viewer-container"
        )
        .appendChild(
            renderer.domElement
        );

    return renderer;

}