const profileCircle = document.getElementById('profileCircle');
const fileInput = document.getElementById('fileInput');
const profileImage = document.getElementById('profileImage');
const addIcon = document.getElementById('addIcon');

// 프로필 영역 클릭 시 파일 선택 창 열기
profileCircle.addEventListener('click', () => {
    if (profileImage.style.display === 'block') {
        // 이미지가 보이는 상태일 때, 숨기기 처리
        profileImage.style.display = 'none';
        addIcon.style.display = 'block'; // '+' 아이콘 보이기
        fileInput.value = ''; // 파일 선택 초기화
    } else {
        // 이미지가 보이지 않는 상태일 때, 파일 선택 창 열기
        fileInput.click();
    }
});

// 파일 선택 시 이미지 미리보기 처리
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // 선택한 파일 가져오기

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            profileImage.src = e.target.result; // 이미지 소스 업데이트
            profileImage.style.display = 'block'; // 이미지 보이기
            addIcon.style.display = 'none'; // '+' 아이콘 숨기기
        };

        reader.readAsDataURL(file); // 파일 읽기 시작
    }
});
