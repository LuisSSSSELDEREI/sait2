// Обработчик для модального окна "Контакты"
document.addEventListener('DOMContentLoaded', function() {
    const contactsModal = document.getElementById('contactsModal');
    const contactsLink = document.querySelector('a[href="#contacts"]');
    const closeContactsBtn = contactsModal.querySelector('.close-btn');

    contactsLink.addEventListener('click', function(e) {
        e.preventDefault();
        contactsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    closeContactsBtn.addEventListener('click', function() {
        contactsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', function(e) {
        if (e.target == contactsModal) {
            contactsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});
