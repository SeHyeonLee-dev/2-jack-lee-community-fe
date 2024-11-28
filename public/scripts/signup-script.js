const registerForm = document.querySelector('.signup-form');

// 회원가입
// 이미지 업로드는 별도로 처리
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const re_password = document.getElementById('confirmPwInput').value;
    const nickname = document.getElementById('nicknameInput').value;
    const profile_image = document.getElementById('fileInput');

    try {
        // 회원가입 API 요청
        const response = await fetch('http://localhost:3000/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                re_password,
                nickname,
            }),
        });

        const result = await response.json();

        const userId = result.data.id; // 반환된 user_id

        // 프로필 이미지 업로드 API 요청
        if (profile_image.files.length > 0) {
            const formData = new FormData();
            formData.append('profile_image', profile_image.files[0]);

            const uploadResponse = await fetch(
                `http://localhost:3000/users/${userId}/profile-image`,
                {
                    method: 'POST',
                    body: formData,
                },
            );

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
                console.log(
                    `프로필 이미지 업로드 실패: ${uploadResult.message}`,
                );
                alert(`회원가입에 실패했습니다.: ${result.message}`);
                return;
            } else {
                console.log('프로필 이미지 업로드 성공');
            }
        }

        // 회원가입 성공 시 게시글 목록 페이지 이동
        if (confirm('회원가입에 성공했습니다.')) {
            window.location.href = 'post-list.html'; // 확인 버튼 클릭 시 이동
        }
    } catch (error) {
        console.error('Error:', error);
        alert('회원가입 중 문제가 발생했습니다.');
    }
});
