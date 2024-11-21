// 드롭다운을 클릭했을 때 보이거나 숨기도록 함수
document.querySelector('.dropbtn').addEventListener('click', function (event) {
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
document.querySelector('#user-modify-delete').addEventListener('click', () => {
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

// 드롭다운 요소 클릭 시 다른 페이지 이동
const dropdownLinks = document.querySelectorAll('.dropdown-content a');
dropdownLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // html의 a 태그의 기능을 막고 자바스크립트로 페이지 이동을 명령하기 위해 선언
        const linkText = link.textContent.trim();

        switch (linkText) {
            case '회원정보수정':
                window.location.href = 'user-modify.html';
                break;
            case '비밀번호수정':
                window.location.href = 'user-pw-modify.html';
                break;
            case '로그아웃':
                // TODOS: 로그아웃 로직 추가
                break;
            default:
                console.error('Unknown link:', linkText);
        }
    });
});
