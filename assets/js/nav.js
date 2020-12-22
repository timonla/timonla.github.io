const animateNavIcon = () => {
    const navIcon = document.querySelector('.nav-icon');

    navIcon.addEventListener('click', () => {

        navIcon.classList.toggle('open');
    });
}

animateNavIcon();