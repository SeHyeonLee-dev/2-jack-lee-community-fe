const profileCircle = document.getElementById('profileCircle');
const fileInput = document.getElementById('fileInput');
const profileImage = document.getElementById('profileImage');
const addIcon = document.getElementById('addIcon');

// 프로필 영역 클릭 시 파일 선택 창 열기
profileCircle.addEventListener('click', () => {
    fileInput.click();
});

// 파일 선택 시 이미지 미리보기 처리
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // 선택한 파일 가져오기
    console.log(file);

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
