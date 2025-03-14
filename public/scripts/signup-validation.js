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

    const handleValidation = () => {
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
