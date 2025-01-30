import { BASE_URL } from '../global.js';

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPwInput');
    const nicknameInput = document.getElementById('nicknameInput');
    const profileCircle = document.querySelector('.profile-circle');
    const profileImage = document.getElementById('fileInput');
    const signupButton = document.querySelector('.signup-button');
    const helperTexts = document.querySelectorAll('.helper-text');

    const backButton = document.getElementById('back-btn');
    const loginLink = document.querySelector('.login-link');

    // 프로필 사진 업로드 시 uploaded 클래스 추가
    const profileImageUploaded = ({ target }) => {
        const imageElement = document.getElementById('profileImage');

        if (target.files && target.files[0]) {
            const reader = new FileReader();

            reader.onload = ({ target: { result } }) => {
                imageElement.src = result; // 이미지 미리보기
                profileCircle.classList.add('uploaded'); // uploaded 클래스 추가
            };

            reader.readAsDataURL(target.files[0]);
        }
    };

    profileImage.addEventListener('change', profileImageUploaded);

    // 이메일 유효성 검사 함수
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return '이메일을 입력해주세요.';
        if (email.length < 5) return '이메일 형식이 너무 짧습니다.';
        if (!emailRegex.test(email))
            return '올바른 이메일 주소 형식을 입력해주세요.';
        return '';
    };

    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
        if (!password) return '비밀번호를 입력해주세요.';
        if (!passwordRegex.test(password)) {
            return '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야합니다.';
        }
        return '';
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) return '비밀번호를 다시 입력해주세요.';
        if (password !== confirmPassword)
            return '비밀번호가 일치하지 않습니다.';
        return '';
    };

    const validateNickname = (nickname) => {
        if (!nickname) return '닉네임을 입력해주세요.';
        if (/\s/.test(nickname)) return '띄어쓰기를 없애주세요.';
        if (nickname.length > 10)
            return '닉네임은 최대 10자까지 작성 가능합니다.';
        return '';
    };

    const validateProfileUpload = () => {
        if (!profileCircle.classList.contains('uploaded')) {
            return '프로필 사진을 추가해주세요.';
        }
        return '';
    };

    // 이메일 중복 검사 함수
    const checkEmailDuplicate = async (email) => {
        const emailValue = email.trim();
        if (!email) return;

        try {
            const response = await fetch(
                `${BASE_URL}/api/users/check-email?email=${emailValue}`,
            );
            const data = await response.json();

            return !data.available; // `available`이 false이면 중복된 이메일 (true 반환)
        } catch (error) {
            console.error('이메일 중복 검사 오류:', error);
        }
    };

    // 닉네임 중복 검사 함수
    const checkNicknameDuplicate = async (nickname) => {
        const nicknameValue = nickname.trim();
        if (!nicknameValue) return false; // 기본적으로 false 반환

        try {
            const response = await fetch(
                `${BASE_URL}/api/users/check-username?username=${nicknameValue}`,
            );
            const data = await response.json();

            return !data.available; // `available`이 false이면 중복된 닉네임 (true 반환)
        } catch (error) {
            console.error('닉네임 중복 검사 오류:', error);
            return false; // 기본적으로 중복이 없다고 가정
        }
    };

    const handleValidation = async () => {
        const emailError = validateEmail(emailInput.value);
        const passwordError = validatePassword(passwordInput.value);
        const confirmPasswordError = validateConfirmPassword(
            passwordInput.value,
            confirmPasswordInput.value,
        );
        const nicknameError = validateNickname(nicknameInput.value);
        const profileUploadError = validateProfileUpload();

        helperTexts[0].textContent = profileUploadError;
        helperTexts[1].textContent = emailError;
        helperTexts[2].textContent = passwordError;
        helperTexts[3].textContent = confirmPasswordError;
        helperTexts[4].textContent = nicknameError;

        // 비동기 이메일 중복 검사
        if (!emailError) {
            const isDuplicate = await checkEmailDuplicate(emailInput.value);
            if (isDuplicate) {
                helperTexts[1].textContent = '이미 사용 중인 이메일입니다.';
                signupButton.disabled = true;
                signupButton.style.backgroundColor = '#ACA0EB';
                signupButton.style.cursor = 'not-allowed';
                return; // 중복된 경우 실행 중단
            } else {
                helperTexts[1].textContent = '사용 가능한 이메일입니다.';
            }
        }

        // 비동기 닉네임 중복 검사
        if (!nicknameError) {
            const isNicknameDuplicate = await checkNicknameDuplicate(
                nicknameInput.value,
            );
            if (isNicknameDuplicate) {
                helperTexts[4].textContent = '중복된 닉네임입니다.';
                signupButton.disabled = true;
                signupButton.style.backgroundColor = '#ACA0EB';
                signupButton.style.cursor = 'not-allowed';
                return; // 닉네임이 중복된 경우 실행 중단
            } else {
                helperTexts[4].textContent = '사용 가능한 닉네임입니다.';
            }
        }

        if (
            emailError ||
            passwordError ||
            confirmPasswordError ||
            nicknameError ||
            profileUploadError
        ) {
            signupButton.disabled = true;
            signupButton.style.backgroundColor = '#ACA0EB';
            signupButton.style.cursor = 'not-allowed';
        } else {
            signupButton.disabled = false;
            signupButton.style.backgroundColor = '#7F6AEE';
            signupButton.style.cursor = 'pointer';
        }
    };

    profileCircle.addEventListener('click', handleValidation);

    emailInput.addEventListener('blur', handleValidation);
    passwordInput.addEventListener('blur', handleValidation);
    confirmPasswordInput.addEventListener('blur', handleValidation);
    nicknameInput.addEventListener('blur', handleValidation);

    const navigateToLogin = () => {
        window.location.href = '/users/login';
    };

    backButton.addEventListener('click', navigateToLogin);
    loginLink.addEventListener('click', navigateToLogin);

    handleValidation();
});
