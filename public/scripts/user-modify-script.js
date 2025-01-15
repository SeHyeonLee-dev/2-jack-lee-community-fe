import { BASE_URL } from '../../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    let userId = '';
    const profileImage = document.getElementById('profile-image');
    const profileNickname = document.getElementById('profile-nickname');
    const userDeleteButton = document.querySelector('#user-modify-delete');
    const changeProfileButton = document.getElementById('change-profile-btn');
    const profileImageUpload = document.getElementById('profile-image-upload');

    const userModifyProfileImage = document.getElementById(
        'user-modify-profile-image',
    );
    const userModifyNickname = document.getElementById('user-modify-nickname');
    const userModifyNicknameInput = document.getElementById(
        'user-modify-nickname-input',
    );
    const helperTextElement = document.querySelector('.helper-text');
    const userModifyButton = document.getElementById('user-modify-btn');
    const userModifyCompleteButton = document.getElementById(
        'user-modify-complete',
    );

    // Fetch Helper Function - 공통적으로 사용하는 fetch 함수
    const fetchAPI = async (url, options = {}) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };

    // 닉네임 입력 시 헬퍼 텍스트 업데이트 및 회원 탈퇴 버튼 상태 설정
    userModifyNicknameInput.addEventListener('input', () => {
        const nickname = userModifyNicknameInput.value.trim();

        if (!nickname) {
            helperTextElement.textContent = '* 닉네임을 입력해주세요.';
            userModifyButton.disabled = true;
        } else if (nickname.length > 10) {
            helperTextElement.textContent =
                '* 닉네임은 최대 10자까지 작성 가능합니다.';
            userModifyButton.disabled = true;
        } else {
            checkDuplicateNickname(nickname);
        }
    });

    // 닉네임 중복 체크 함수
    const checkDuplicateNickname = async (nickname) => {
        try {
            const result = await fetchAPI(
                `${BASE_URL}/api/users/check-username?username=${nickname}`,
            );
            if (result.available) {
                helperTextElement.textContent = '* 사용 가능한 닉네임입니다.';
                userModifyButton.disabled = false;
            } else {
                helperTextElement.textContent = '* 중복된 닉네임입니다.';
                userModifyButton.disabled = true;
            }
        } catch {
            helperTextElement.textContent =
                '* 닉네임 확인 중 오류가 발생했습니다.';
            userModifyButton.disabled = true;
        }
    };

    // 사용자 프로필 가져오기 및 초기화
    try {
        const result = await fetchAPI(`${BASE_URL}/api/auths/profile`, {
            credentials: 'include',
        });
        if (result) {
            const { username, email, profile_image_url, user_id } = result;

            profileImage.src = profile_image_url
                ? profile_image_url
                : 'https://www.gravatar.com/avatar/?d=mp';

            profileNickname.textContent = `Hi ${username}😊😊`;

            userModifyProfileImage.src = profile_image_url
                ? profile_image_url
                : 'https://www.gravatar.com/avatar/?d=mp';

            userModifyNickname.textContent = email;
            userModifyNicknameInput.value = username;
            userId = user_id;
        } else {
            showLoggedOutState();
        }
    } catch {
        showLoggedOutState();
    }

    // 로그아웃 상태 화면 설정
    const showLoggedOutState = () => {
        profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
        profileNickname.textContent = '로그인 해주세요';
    };

    // 프로필 이미지 클릭 시 드롭다운 토글
    profileImage.addEventListener('click', () => {
        const dropdownContent = document.querySelector('.dropdown-content');
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';

        window.addEventListener('click', (e) => {
            if (!document.querySelector('.dropdown').contains(e.target)) {
                dropdownContent.style.display = 'none';
            }
        });
    });

    // 프로필 변경 버튼 클릭 시 파일 선택창 열기
    changeProfileButton.addEventListener('click', () => {
        profileImageUpload.click();
    });

    // 파일 업로드 시 미리보기 업데이트
    profileImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userModifyProfileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 사용자 프로필 업데이트
    const updateUserProfile = async () => {
        const nickname = userModifyNicknameInput.value;
        const file = profileImageUpload.files[0];
        if (!nickname) {
            alert('닉네임을 입력해주세요!');
            return;
        }

        let profileImageUrl = '';
        if (file) {
            const formData = new FormData();
            formData.append('profile_image', file);
            try {
                const result = await fetchAPI(
                    `http://localhost:3000/api/users/${userId}/profile-image`,
                    {
                        method: 'POST',
                        body: formData,
                    },
                );
                profileImageUrl = result.data.profile_image_url;
            } catch {
                alert('이미지 업로드 중 오류가 발생했습니다.');
                return;
            }
        }

        try {
            await fetchAPI(`http://localhost:3000/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: nickname,
                    profile_image_url: profileImageUrl,
                }),
            });
            alert('프로필이 성공적으로 업데이트되었습니다!');
        } catch {
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };

    userModifyButton.addEventListener('click', updateUserProfile);

    // 드롭다운 메뉴 클릭 이벤트 처리
    document
        .querySelector('.dropdown-content')
        .addEventListener('click', async (event) => {
            event.preventDefault();

            const link = event.target;
            if (link.tagName !== 'A') return;

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
                        await handleLogout();
                        break;
                    default:
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
        } catch {
            alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 회원 탈퇴 처리
    userDeleteButton.addEventListener('click', () => {
        const UserDeleteModal = document.getElementById('user-delete-modal-id');
        const cancelDelete = document.getElementById('cancel-btn-id');
        const confirmDelete = document.getElementById('confirm-btn-id');

        UserDeleteModal.style.display = 'flex';

        cancelDelete.onclick = () => {
            UserDeleteModal.style.display = 'none';
        };

        confirmDelete.onclick = async () => {
            try {
                await fetchAPI(`http://localhost:3000/api/users/${userId}`, {
                    method: 'DELETE',
                });
                alert('회원 탈퇴가 성공적으로 처리되었습니다.');
                window.location.href = '/users/login';
            } catch {
                alert('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
            UserDeleteModal.style.display = 'none';
        };
    });

    // 수정 완료 버튼 클릭 시 게시글 페이지로 이동
    userModifyCompleteButton.addEventListener('click', () => {
        window.location.href = '/posts';
    });
});
