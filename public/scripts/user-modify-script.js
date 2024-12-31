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

    // helper text 값 변경 함수
    userModifyNicknameInput.addEventListener('input', () => {
        const nickname = userModifyNicknameInput.value.trim();

        // 조건 1: 닉네임 입력하지 않을 시
        if (nickname === '') {
            helperTextElement.textContent = '* 닉네임을 입력해주세요.';
        }
        // 조건 2: 닉네임 중복 시 (중복 체크 로직 생략)
        else if (isDuplicateNickname(nickname)) {
            helperTextElement.textContent = '*중복된 닉네임입니다.';
        }
        // 조건 3: 닉네임 11자 이상 작성 시
        else if (nickname.length > 10) {
            helperTextElement.textContent =
                '* 닉네임은 최대 10자까지 작성 가능합니다.';
        }
        // 정상적인 닉네임 입력 시
        else {
            helperTextElement.textContent = '* 사용 가능한 닉네임입니다.';
        }
    });

    async function isDuplicateNickname(nickname) {
        try {
            const response = await fetch(
                `${BASE_URL}/api/users/check-nickname?nickname=${nickname}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            const checkNickname = await response.json();

            if (!checkNickname.available) {
                helperTextElement.textContent = '* 중복된 닉네임입니다.';
            } else {
                helperTextElement.textContent = '* 사용 가능한 닉네임입니다.';
            }
        } catch (error) {
            helperTextElement.textContent =
                '* 닉네임 확인 중 오류가 발생했습니다.';
            console.error(error);
        }
    }

    // 로그인 상태에 따라 프로필 업데이트
    try {
        const response = await fetch(`${BASE_URL}/api/auths/profile`, {
            credentials: 'include',
        });
        const result = await response.json();

        if (result) {
            const { nickname, email, profile_image } = result;

            // 헤더 사용자 정보
            profileImage.src = profile_image;
            profileNickname.textContent = 'Hi ' + nickname + '😊😊';

            // 수정 화면 사용자 정보
            userModifyProfileImage.src = profile_image;
            userModifyNickname.textContent = email;
            userModifyNicknameInput.value = nickname;
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

    // "변경" 버튼 클릭 시 파일 선택 창 열기
    changeProfileButton.addEventListener('click', () => {
        profileImageUpload.click();
    });

    // 파일 선택 시 이미지 업데이트
    profileImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userModifyProfileImage.src = e.target.result; // 이미지 미리보기 업데이트
            };
            reader.readAsDataURL(file); // 파일 내용을 읽음
        }
    });

    async function updateUserProfile() {
        const nickname = userModifyNicknameInput.value; // 닉네임 값 가져오기
        const file = profileImageUpload.files[0]; // 업로드된 파일 가져오기

        if (!nickname) {
            alert('닉네임을 입력해주세요!');
            return;
        }

        let profileImageUrl = null;

        console.log(userId);

        if (file) {
            // 프로필 이미지 업로드
            const formData = new FormData();
            formData.append('profile_image', file);

            try {
                const uploadResponse = await fetch(
                    `http://localhost:3000/api/users/${userId}/profile-image`,
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

                if (!uploadResponse.ok) {
                    throw new Error('이미지 업로드 실패');
                }

                const uploadResult = await uploadResponse.json();

                profileImageUrl = uploadResult.data.profile_image; // 업로드된 이미지 URL
                console.log('profileImageUrl', profileImageUrl);
            } catch (error) {
                console.error(error);
                alert('이미지 업로드 중 오류가 발생했습니다.');
                return;
            }
        }

        // PATCH 요청 데이터 생성
        const body = {
            nickname,
            profile_image: profileImageUrl || profileImage.src, // 기존 이미지 URL 사용
        };

        console.log(body);

        try {
            const response = await fetch(
                `http://localhost:3000/api/users/${userId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                },
            );

            if (!response.ok) {
                throw new Error('프로필 업데이트 실패');
            }

            alert('프로필이 성공적으로 업데이트되었습니다!');
        } catch (error) {
            console.error(error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    }

    userModifyButton.addEventListener('click', () => {
        updateUserProfile();
    });

    // 회원탈퇴 버튼 이벤트 리스너
    userDeleteButton.addEventListener('click', () => {
        const UserDeleteModal = document.getElementById('user-delete-modal-id');
        const cancelDelete = document.getElementById('cancel-btn-id');
        const confirmDelete = document.getElementById('confirm-btn-id');

        UserDeleteModal.style.display = 'flex';

        cancelDelete.onclick = () => {
            UserDeleteModal.style.display = 'none';
        };

        confirmDelete.onclick = async () => {
            // 여기에 회원 탈퇴 로직 추가
            try {
                const response = await fetch(
                    `http://localhost:3000/api/users/${userId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error('회원 탈퇴 실패');
                }

                alert('회원 탈퇴가 성공적으로 처리되었습니다.');
                window.location.href = '/users/login';
            } catch (error) {
                console.error('회원 탈퇴 중 오류 발생:', error);
                alert('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
            }

            UserDeleteModal.style.display = 'none';
        };
    });

    // 수정 완료 버튼 클릭 시 게시글 페이지 이동동
    userModifyCompleteButton.addEventListener('click', () => {
        window.location.href = `/posts`;
    });
});
