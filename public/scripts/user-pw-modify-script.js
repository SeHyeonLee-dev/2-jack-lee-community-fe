import { BASE_URL } from '../global.js';

const checkAuth = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/auths/check-session`, {
            method: 'GET',
            credentials: 'include', // ✅ 세션 쿠키 포함 필수
        });

        if (response.status === 401) {
            console.warn(
                'Unauthorized access detected. Redirecting to login page...',
            );
            window.location.href = '/users/login'; // ✅ 로그인 페이지로 강제 이동
        }
    } catch (error) {
        console.error('Error checking auth:', error);
    }
};

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', checkAuth);

document.addEventListener('DOMContentLoaded', async () => {
    let userId = '';
    const passwordInput = document.querySelector(
        'input[placeholder="비밀번호를 입력하세요"]',
    );
    const confirmPasswordInput = document.querySelector(
        'input[placeholder="비밀번호를 한번 더 입력하세요"]',
    );
    const helperTextPassword = passwordInput.nextElementSibling;
    const helperTextConfirmPassword = confirmPasswordInput.nextElementSibling;
    const modifyButton = document.getElementById('user-pw-modify-btn');

    // 초기 버튼 상태 비활성화
    modifyButton.disabled = true;

    const validatePassword = (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:";'<>?,.\/]).{8,20}$/.test(
            password,
        );

    const updateHelperText = () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        helperTextPassword.textContent = !password
            ? '* 비밀번호를 입력해주세요'
            : !validatePassword(password)
              ? '* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다'
              : '';

        helperTextConfirmPassword.textContent = !confirmPassword
            ? '* 비밀번호를 한번 더 입력해주세요'
            : password !== confirmPassword
              ? '* 비밀번호와 다릅니다'
              : '';

        // 버튼 활성화 상태 업데이트
        modifyButton.disabled = !(
            validatePassword(password) && password === confirmPassword
        );
        modifyButton.style.backgroundColor = modifyButton.disabled
            ? '#aca0eb'
            : '#7f6aee';
        modifyButton.style.cursor = modifyButton.disabled
            ? 'not-allowed'
            : 'pointer';
    };

    // 이벤트 리스너 추가
    passwordInput.addEventListener('input', updateHelperText);
    confirmPasswordInput.addEventListener('input', updateHelperText);

    const profileImage = document.getElementById('profile-image');
    const profileNickname = document.getElementById('profile-nickname');

    // 공통 fetch 함수 정의
    const fetchAPI = async (url, options = {}) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok)
                throw new Error(`Fetch failed: ${response.statusText}`);
            return response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };

    const showLoggedOutState = () => {
        profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
        profileNickname.textContent = '로그인 해주세요';
    };

    // 로그인 상태에 따라 프로필 업데이트
    try {
        const result = await fetchAPI(`${BASE_URL}/api/auths/profile`, {
            credentials: 'include',
        });

        if (result) {
            const { username, profile_image_url, user_id } = result;
            profileImage.src = profile_image_url
                ? profile_image_url
                : 'https://www.gravatar.com/avatar/?d=mp';
            profileNickname.textContent = `Your NickName: ${username}`;
            userId = user_id;
        } else {
            showLoggedOutState();
        }

        // 드롭다운 요소 클릭 시 다른 페이지 이동
        document
            .querySelector('.dropdown-content')
            .addEventListener('click', async (event) => {
                event.preventDefault();

                const link = event.target;
                if (link.tagName !== 'A') return;

                const linkText = link.textContent.trim();
                try {
                    if (linkText === '회원정보수정') {
                        window.location.href = `/users/${userId}/edit`;
                    } else if (linkText === '비밀번호수정') {
                        window.location.href = `/users/${userId}/edit-pw`;
                    } else if (linkText === '로그아웃') {
                        await handleLogout();
                    } else {
                        console.error('Unknown link:', linkText);
                    }
                } catch (error) {
                    console.error('Error handling dropdown link:', error);
                }
            });

        // 로그아웃 처리 함수
        const handleLogout = async () => {
            try {
                await fetchAPI(`${BASE_URL}/api/auths/logout`, {
                    method: 'POST',
                    credentials: 'include',
                });
                window.location.href = '/posts';
            } catch (error) {
                alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
                console.error(error);
            }
        };
    } catch (error) {
        console.error(error);
        showLoggedOutState();
    }

    // 프로필을 클릭했을 때 보이거나 숨기도록 함수
    profileImage.addEventListener('click', () => {
        const dropdownContent = document.querySelector('.dropdown-content');
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';

        const handleOutsideClick = (e) => {
            if (!document.querySelector('.dropdown').contains(e.target)) {
                dropdownContent.style.display = 'none';
                window.removeEventListener('click', handleOutsideClick);
            }
        };
        window.addEventListener('click', handleOutsideClick);
    });

    modifyButton.addEventListener('click', async () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        try {
            await fetchAPI(
                `http://localhost:3000/api/users/update-password/${userId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        password,
                        re_password: confirmPassword,
                    }),
                },
            );
            alert('비밀번호가 성공적으로 변경되었습니다.');
            window.location.href = '/posts';
        } catch (error) {
            alert('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
            console.error(error);
        }
    });
});
