// Обработчик для модального окна "О нас"
document.addEventListener('DOMContentLoaded', function() {
    const aboutModal = document.getElementById('aboutModal');
    const aboutLink = document.querySelector('a[href="#about"]');
    const closeAboutBtn = aboutModal.querySelector('.close-btn');

    aboutLink.addEventListener('click', function(e) {
        e.preventDefault();
        aboutModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    closeAboutBtn.addEventListener('click', function() {
        aboutModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', function(e) {
        if (e.target == aboutModal) {
            aboutModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});
