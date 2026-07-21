import { frontView } from '../camera/frontView.js';
import { backView } from '../camera/backView.js';
import { leftView } from '../camera/leftView.js';
import { rightView } from '../camera/rightView.js';
import { topView } from '../camera/topView.js';
import { bottomView } from '../camera/bottomView.js';

export function createViewCube(camera, controls) {
    const viewCube = document.getElementById('view-cube') || document.createElement('div');
    viewCube.id = 'view-cube';

    viewCube.innerHTML = `
        <div class="view-cube-box">
            <div class="cube-face face-front" data-view="front">Front</div>
            <div class="cube-face face-back" data-view="back">Back</div>
            <div class="cube-face face-left" data-view="left">Left</div>
            <div class="cube-face face-right" data-view="right">Right</div>
            <div class="cube-face face-top" data-view="top">Top</div>
            <div class="cube-face face-bottom" data-view="bottom">Bottom</div>
        </div>
    `;

    if (!viewCube.parentNode) {
        document.body.appendChild(viewCube);
    }

    const cubeBox = viewCube.querySelector('.view-cube-box');

    // Function to update cube rotation based on camera
    function updateCubeRotation() {
        if (!camera || !cubeBox) return;

        // Extract camera rotation matrix from world matrix inverse
        const e = camera.matrixWorldInverse.elements;

        // CSS matrix3d representation (column-major).
        // We negate the Y row and Y column because CSS Y points down while Three.js Y points up.
        const cssMatrix = [
            e[0],  -e[1],  e[2],  0,
           -e[4],   e[5], -e[6],  0,
            e[8],  -e[9],  e[10], 0,
            0,      0,     0,     1
        ];

        cubeBox.style.transform = `matrix3d(${cssMatrix.join(',')})`;
    }

    // Register click handlers for each face
    viewCube.querySelectorAll('.cube-face').forEach(face => {
        face.addEventListener('click', () => {
            const view = face.getAttribute('data-view');
            if (view === 'front') frontView(camera, controls);
            else if (view === 'back') backView(camera, controls);
            else if (view === 'left') leftView(camera, controls);
            else if (view === 'right') rightView(camera, controls);
            else if (view === 'top') topView(camera, controls);
            else if (view === 'bottom') bottomView(camera, controls);
        });
    });

    // Register controls change event to update cube rotation
    if (controls) {
        controls.addEventListener('change', updateCubeRotation);
    }

    // Run initial update
    updateCubeRotation();
}