import { BASE_URL } from '../../global.js';

document.addEventListener('DOMContentLoaded', () => {
    const jackTitle = document.getElementById('jack-title');
    const loginButton = document.getElementById('login-btn');
    const signupButton = document.getElementById('signup-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // 제목 클릭시 게시글 페이지 이동
    jackTitle.addEventListener('click', () => {
        window.location.href = '/posts';
    });

    // 회원가입 버튼 클릭 시 회원가입 페이지 이동
    signupButton.addEventListener('click', () => {
        window.location.href = '/users/register';
    });

    // 로그인 시 로그인 이벤트 처리
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault(); // 폼 기본 동작 방지

        // 사용자 입력 값 가져오기
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert('이메일과 비밀번호를 입력하세요.');
            return;
        }

        try {
            // 서버로 로그인 요청
            const response = await fetch(`${BASE_URL}/api/auths/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                // 로그인 성공
                alert('로그인 성공');
                setTimeout(() => {
                    window.location.href = '/posts'; // 성공 후 리다이렉트
                }, 1000);
            } else {
                // 로그인 실패
                alert('로그인 실패');
            }
        } catch (error) {
            // 네트워크 또는 서버 오류 처리
            alert('서버와의 통신에 실패했습니다.');
            console.error('Error:', error);
        }
    });
});
