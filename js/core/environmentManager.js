import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { agentLog } from '../utils/agentLog.js';

export function createEnvironment(scene) {
    // 1. Hệ thống chiếu sáng Studio 3 điểm trung hòa để đảm bảo màu sắc tươi sáng và đổ bóng đẹp mắt
    
    // Ánh sáng môi trường dịu (Ambient Light) để nâng tổng thể vùng tối, giữ màu gốc tươi sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Ánh sáng chính (Key Light) - Đèn chính chiếu xéo từ trên xuống tạo khối và bóng đổ sắc nét
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(15, 30, 20);
    keyLight.castShadow = true;
    
    // Cấu hình bóng đổ chất lượng cao, khử răng cưa
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 150;
    
    // Căn chỉnh khoảng giới hạn camera bóng đổ cho vừa vặn các mô hình lớn
    const d = 40;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    
    scene.add(keyLight);

    // Ánh sáng phụ (Fill Light) - Chiếu từ góc đối diện để làm mềm các vùng bóng tối
    const fillLight = new THREE.DirectionalLight(0xf0f4ff, 1.0);
    fillLight.position.set(-15, 10, -15);
    scene.add(fillLight);

    // Ánh sáng viền (Rim Light) - Chiếu từ sau/dưới lên tạo điểm nhấn và tách biệt mô hình với nền
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, -20, 0);
    scene.add(rimLight);

    // 2. Nạp bản đồ phản xạ môi trường HDR (specular reflections) tạo chiều sâu chân thực
    const loader = new RGBELoader();
    loader.load(
        "./assets/hdr/studio_small_09_1k.hdr",
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            console.log("Môi trường phản xạ HDR đã được nạp thành công!");
            // #region agent log
            agentLog('environmentManager.js:49', 'HDR loaded OK', { hasEnvironment: !!scene.environment, textureSize: texture?.image?.width, lightsInScene: scene.children.filter(c => c.isLight).map(l => ({ type: l.type, intensity: l.intensity })) }, 'A');
            // #endregion
        },
        undefined,
        (error) => {
            console.warn("Không thể tải bản đồ HDR. Sử dụng hệ thống đèn chiếu sáng mặc định.", error);
            // #region agent log
            agentLog('environmentManager.js:56', 'HDR load FAILED', { error: String(error), hasEnvironment: !!scene.environment, lightsInScene: scene.children.filter(c => c.isLight).map(l => ({ type: l.type, intensity: l.intensity })) }, 'A');
            // #endregion
        }
    );
}