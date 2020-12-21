const navSlide = () => {
    const mobileNav = document.querySelector('.nav-mobile');
    const nav = document.querySelector('.nav-items');
    const navItems = document.querySelectorAll('.nav-items li');

    mobileNav.addEventListener('click', () => {
        nav.classList.toggle('nav-active');

        navItems.forEach((item, index) => {
            if (item.style.animation) {
                item.style.animation = ''
            } else {
                item.style.animation = `navItemFade 0.5s ease forwards ${index / 5 + 0.5}s`;
            }
        });

        mobileNav.classList.toggle('toggle');
    });

}

navSlide();