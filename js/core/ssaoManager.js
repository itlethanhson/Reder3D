import * as THREE from 'three';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';

export function createSSAOPass(
    composer,
    scene,
    camera
) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const ssaoPass = new SSAOPass(
        scene,
        camera,
        width,
        height
    );

    // Cấu hình chất lượng cao nhưng tối ưu hiệu năng
    ssaoPass.kernelSize = 32; // Số mẫu ngẫu nhiên
    ssaoPass.kernelRadius = 8; // Bán kính bóng mặc định (sẽ cập nhật động)
    ssaoPass.minDistance = 0.001;
    ssaoPass.maxDistance = 0.1;

    // Thêm pass vào composer
    composer.addPass(
        ssaoPass
    );

    return ssaoPass;
}
