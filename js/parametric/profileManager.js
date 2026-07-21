/**
 * Giao tiếp với PHP API: lưu/tải/xóa profile từ MySQL
 */

const API_BASE = './api/';

/**
 * Lưu profile lên server
 * @param {object} profile { name, shapeId, material, params, slug? }
 * @returns {Promise<object>}
 */
export async function saveProfile(profile) {
    const res = await fetch(API_BASE + 'save_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lưu thất bại');
    return data;
}

/**
 * Lấy danh sách profile
 * @returns {Promise<Array>}
 */
export async function listProfiles() {
    const res = await fetch(API_BASE + 'list_profiles.php');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Tải danh sách thất bại');
    return data.profiles || [];
}

/**
 * Tải một profile theo slug
 * @param {string} slug
 * @returns {Promise<object>}
 */
export async function loadProfile(slug) {
    const res = await fetch(API_BASE + `list_profiles.php?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Tải profile thất bại');
    return data.profile;
}

/**
 * Xóa profile
 * @param {string} slug
 */
export async function deleteProfile(slug) {
    const res = await fetch(API_BASE + 'delete_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
    return data;
}
