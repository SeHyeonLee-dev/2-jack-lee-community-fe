import { BASE_URL } from '../../global.js';

const registerForm = document.querySelector('.signup-form');

// Fetch API 요청 함수
const sendFetchRequest = async (url, options) => {
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'API 요청 실패');
        }
        return result;
    } catch (error) {
        console.error(`Error during fetch: ${error.message}`);
        throw error;
    }
};

// 회원가입
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const re_password = document.getElementById('confirmPwInput').value;
    const nickname = document.getElementById('nicknameInput').value;
    const profile_image = document.getElementById('fileInput');

    try {
        // 회원가입 API 요청
        const registerData = {
            email,
            password,
            re_password,
            nickname,
        };

        const result = await sendFetchRequest(
            `${BASE_URL}/api/users/register`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData),
            },
        );

        const userId = result.data.id; // 반환된 user_id

        // 프로필 이미지 업로드 API 요청
        if (profile_image.files.length > 0) {
            const formData = new FormData();
            formData.append('profile_image', profile_image.files[0]);

            await sendFetchRequest(
                `${BASE_URL}/api/users/${userId}/profile-image`,
                {
                    method: 'POST',
                    body: formData,
                },
            );
            console.log('프로필 이미지 업로드 성공');
        }

        // 회원가입 성공 시 게시글 목록 페이지 이동
        if (confirm('회원가입에 성공했습니다.')) {
            window.location.href = '/posts'; // 확인 버튼 클릭 시 이동
        }
    } catch (error) {
        alert(`회원가입 중 문제가 발생했습니다: ${error.message}`);
    }
});
