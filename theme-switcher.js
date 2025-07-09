document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    if (!themeToggleButton) {
        return;
    }

    themeToggleButton.addEventListener('click', () => {
        // Toggle the theme
        if (htmlElement.classList.contains('light-mode')) {
            htmlElement.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // The initial theme is set by the inline script in the <head>
});
