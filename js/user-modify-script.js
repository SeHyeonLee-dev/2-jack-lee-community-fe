// 드롭다운을 클릭했을 때 보이거나 숨기도록 함수
document.querySelector('.dropbtn').addEventListener('click', function(event) {
    var dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    
    // 클릭한 이벤트가 다른 곳에서 발생하면 드롭다운을 닫는 함수
    window.addEventListener('click', function(e) {
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
    }

    confirmDelete.onclick = () => {
        // 여기에 회원 탈퇴 로직 추가
        UserDeleteModal.style.display = 'none';
    }

});
