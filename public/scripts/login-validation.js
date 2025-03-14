document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const helperText = document.querySelector('.pw-helper');
    const loginButton = document.getElementById('login-btn');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return '이메일을 입력해주세요.';
        } else if (email.length < 5) {
            return '이메일 형식이 너무 짧습니다.';
        } else if (!emailRegex.test(email)) {
            return '올바른 이메일 주소 형식을 입력해주세요.';
        }
        return '';
    };

    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
        if (!password) {
            return '비밀번호를 입력해주세요.';
        } else if (!passwordRegex.test(password)) {
            return '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        }
        return '';
    };

    const handleValidation = () => {
        const emailError = validateEmail(emailInput.value);
        const passwordError = validatePassword(passwordInput.value);

        if (emailError) {
            helperText.textContent = emailError;
            setButtonDisabled(true);
        } else if (passwordError) {
            helperText.textContent = passwordError;
            setButtonDisabled(true);
        } else {
            helperText.textContent = '';
            setButtonDisabled(false);
        }
    };

    const setButtonDisabled = (isDisabled) => {
        loginButton.style.backgroundColor = isDisabled ? '#ACA0EB' : '#7F6AEE';
        loginButton.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
    };

    // 이메일 유효성 검사
    emailInput.addEventListener('input', handleValidation);
    // 비밀번호 유효성 검사
    passwordInput.addEventListener('input', handleValidation);
});
