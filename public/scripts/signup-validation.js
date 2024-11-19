document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const nicknameInput = document.getElementById('nickname');
    const profileCircle = document.querySelector('.profile-circle');
    const signupButton = document.querySelector('.signup-button');
    const helperTexts = document.querySelectorAll('.helper-text');

    const backButton = document.getElementById('back-btn');
    const loginLink = document.querySelector('.login-link');

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return '이메일을 입력해주세요.';
        } else if (email.length < 5) {
            return '이메일 형식이 너무 짧습니다.';
        } else if (!emailRegex.test(email)) {
            return '올바른 이메일 주소 형식을 입력해주세요.';
        }
        return '';
    }

    function validatePassword(password) {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
        if (!password) {
            return '비밀번호를 입력해주세요.';
        } else if (!passwordRegex.test(password)) {
            return '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야합니다.';
        }
        return '';
    }

    function validateConfirmPassword(password, confirmPassword) {
        if (!confirmPassword) {
            return '비밀번호를 다시 입력해주세요.';
        } else if (password !== confirmPassword) {
            return '비밀번호가 일치하지 않습니다.';
        }
        return '';
    }

    function validateNickname(nickname) {
        if (!nickname) {
            return '닉네임을 입력해주세요.';
        } else if (/\s/.test(nickname)) {
            return '띄어쓰기를 없애주세요.';
        } else if (nickname.length > 10) {
            return '닉네임은 최대 10자까지 작성 가능합니다.';
        }
        return '';
    }

    function validateProfileUpload() {
        if (!profileCircle.classList.contains('uploaded')) {
            return '프로필 사진을 추가해주세요.';
        }
        return '';
    }

    function handleValidation() {
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
    }

    profileCircle.addEventListener('click', () => {
        handleValidation();
    });

    emailInput.addEventListener('blur', handleValidation);
    passwordInput.addEventListener('blur', handleValidation);
    confirmPasswordInput.addEventListener('blur', handleValidation);
    nicknameInput.addEventListener('blur', handleValidation);

    function navigateToLogin() {
        window.location.href = 'login.html';
    }

    backButton.addEventListener('click', navigateToLogin);
    loginLink.addEventListener('click', navigateToLogin);

    handleValidation();
});
