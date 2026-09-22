(() => {
  const root = document.documentElement;
  const body = document.body;
  const themeButton = document.querySelector('[data-guide-theme-toggle]');

  const applyTheme = (theme) => {
    const dark = theme === 'dark';
    body.classList.toggle('dark-mode', dark);
    body.style.backgroundColor = dark ? '#141414' : '#f5f7fa';
    body.style.color = dark ? '#e6e6e6' : '#1f2937';
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--bg-color', dark ? '#141414' : '#f5f7fa');
    if (themeButton) {
      themeButton.textContent = dark ? '☀' : '☾';
      themeButton.setAttribute('aria-label', dark ? 'Light mode' : 'Dark mode');
      themeButton.setAttribute('title', dark ? 'Light mode' : 'Dark mode');
    }
  };

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const nextTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
      localStorage.setItem('hsmkit-theme', nextTheme);
      applyTheme(nextTheme);
    });
    applyTheme(body.classList.contains('dark-mode') ? 'dark' : 'light');
  }

  const languageSelect = document.querySelector('.guides-language-switcher select');
  languageSelect?.addEventListener('change', (event) => {
    const language = event.target.value === 'zh' ? 'zh' : 'en';
    const parts = location.pathname.split('/').filter(Boolean);
    const slug = parts[0] === 'zh' ? parts[2] : parts[1];
    localStorage.setItem('language', language);
    location.assign(`${language === 'zh' ? '/zh' : ''}/guides${slug ? `/${slug}` : ''}`);
  });

  const searchInput = document.querySelector('.guides-search-input input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLocaleLowerCase();
      document.querySelectorAll('[data-guide-card]').forEach((card) => {
        const haystack = (card.getAttribute('data-guide-search') || '').toLocaleLowerCase();
        card.hidden = Boolean(query) && !haystack.includes(query);
      });
      document.querySelectorAll('[data-guide-section]').forEach((section) => {
        const cards = [...section.querySelectorAll('[data-guide-card]')];
        section.hidden = Boolean(query) && cards.length > 0 && cards.every((card) => card.hidden);
      });
    });
  }
})();
