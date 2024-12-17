document.addEventListener('DOMContentLoaded', async () => {
    const profileImage = document.getElementById('profile-image');
    const profileNickname = document.getElementById('profile-nickname');
    const userDeleteButton = document.querySelector('#user-modify-delete');

    // 로그인 상태에 따라 프로필 업데이트
    try {
        const response = await fetch(
            'http://localhost:3000/api/auths/profile',
            { credentials: 'include' },
        );
        const result = await response.json();

        if (result) {
            const { nickname, profile_image } = result;
            profileImage.src = profile_image;
            profileNickname.textContent = 'Your NickName: ' + nickname;
        } else {
            showLoggedOutState();
        }

        const userId = result.id;

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
                    'http://localhost:3000/api/auths/logout',
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

    // 회원탈퇴 버튼 이벤트 리스너
    userDeleteButton.addEventListener('click', () => {
        const UserDeleteModal = document.getElementById('user-delete-modal-id');
        const cancelDelete = document.getElementById('cancel-btn-id');
        const confirmDelete = document.getElementById('confirm-btn-id');

        console.log(UserDeleteModal);
        console.log(cancelDelete);
        console.log(confirmDelete);

        UserDeleteModal.style.display = 'flex';

        cancelDelete.onclick = () => {
            UserDeleteModal.style.display = 'none';
        };

        confirmDelete.onclick = () => {
            // 여기에 회원 탈퇴 로직 추가
            UserDeleteModal.style.display = 'none';
        };
    });
});
