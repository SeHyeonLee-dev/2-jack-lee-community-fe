import { BASE_URL } from '../../global.js';

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

    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:";'<>?,.\/]).{8,20}$/;
        return passwordRegex.test(password);
    };

    const updateHelperText = () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!password) {
            helperTextPassword.textContent = '* 비밀번호를 입력해주세요';
        } else if (!validatePassword(password)) {
            helperTextPassword.textContent =
                '* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다';
        } else {
            helperTextPassword.textContent = '';
        }

        if (!confirmPassword) {
            helperTextConfirmPassword.textContent =
                '* 비밀번호를 한번 더 입력해주세요';
        } else if (password !== confirmPassword) {
            helperTextConfirmPassword.textContent = '* 비밀번호와 다릅니다';
        } else {
            helperTextConfirmPassword.textContent = '';
        }

        // 버튼 활성화 상태 업데이트
        if (validatePassword(password) && password === confirmPassword) {
            modifyButton.disabled = false;
            modifyButton.style.backgroundColor = '#7f6aee'; // 활성화된 색상
            modifyButton.style.cursor = 'pointer';
        } else {
            modifyButton.disabled = true;
            modifyButton.style.backgroundColor = '#aca0eb'; // 비활성화된 색상
            modifyButton.style.cursor = 'not-allowed';
        }
    };

    // 이벤트 리스너 추가
    passwordInput.addEventListener('input', updateHelperText);
    confirmPasswordInput.addEventListener('input', updateHelperText);

    const profileImage = document.getElementById('profile-image');
    const profileNickname = document.getElementById('profile-nickname');
    // 로그인 상태에 따라 프로필 업데이트
    try {
        const response = await fetch(`${BASE_URL}/api/auths/profile`, {
            credentials: 'include',
        });
        const result = await response.json();

        if (result) {
            const { nickname, profile_image } = result;
            profileImage.src = profile_image;
            profileNickname.textContent = 'Your NickName: ' + nickname;
        } else {
            showLoggedOutState();
        }

        userId = result.id;

        // 드롭다운 요소 클릭 시 다른 페이지 이동
        document
            .querySelector('.dropdown-content')
            .addEventListener('click', async (event) => {
                event.preventDefault(); // 기본 a 태그 동작 방지

                const link = event.target; // 클릭된 요소 가져오기
                if (link.tagName !== 'A') return; // 클릭된 요소가 a 태그가 아닌 경우 무시

                const linkText = link.textContent.trim();

                try {
                    switch (linkText) {
                        case '회원정보수정':
                            window.location.href = `/users/${userId}/edit`;
                            break;
                        case '비밀번호수정':
                            window.location.href = `/users/${userId}/edit-pw`;
                            break;
                        case '로그아웃':
                            await handleLogout(); // 로그아웃 로직
                            break;
                        default:
                            console.error('Unknown link:', linkText);
                    }
                } catch (error) {
                    console.error('Error handling dropdown link:', error);
                }
            });
        // 로그아웃 처리 함수
        async function handleLogout() {
            console.log('test');
            try {
                const logoutResponse = await fetch(
                    `${BASE_URL}/api/auths/logout`,
                    {
                        method: 'POST',
                        credentials: 'include',
                    },
                );

                if (!logoutResponse.ok) {
                    throw new Error('Failed to log out');
                }

                // 로그아웃 성공 시 메인 페이지로 리다이렉트
                window.location.href = '/posts';
            } catch (error) {
                console.error('Error during logout:', error);
                alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
            }
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        showLoggedOutState();
    }

    function showLoggedOutState() {
        profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
        profileNickname.textContent = '로그인 해주세요';
    }

    // 프로필을 클릭했을 때 보이거나 숨기도록 함수
    profileImage.addEventListener('click', function () {
        var dropdownContent = document.querySelector('.dropdown-content');
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';

        // 클릭한 이벤트가 다른 곳에서 발생하면 드롭다운을 닫는 함수
        window.addEventListener('click', function (e) {
            if (!document.querySelector('.dropdown').contains(e.target)) {
                dropdownContent.style.display = 'none';
            }
        });
    });

    modifyButton.addEventListener('click', async () => {
        const passwordInput = document.getElementById('pw-input');
        const rePasswordInput = document.getElementById('re-pw-input');

        try {
            const response = await fetch(
                `http://localhost:3000/api/users/update-password/${userId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        password: passwordInput.value,
                        re_password: rePasswordInput.value,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('비밀번호 변경 실패');
            }

            const result = await response.json();
            alert('비밀번호가 성공적으로 변경되었습니다.');
            window.location.href = '/posts';
        } catch (error) {
            console.error('비밀번호 변경 중 오류 발생:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    });
});
