(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  const body = document.body;

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 16);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    navigation.classList.remove('open');
    body.classList.remove('menu-open');
  };
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    navigation.classList.toggle('open', !isOpen);
    body.classList.toggle('menu-open', !isOpen);
  });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox.querySelector('img');
  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const image = item.querySelector('img');
      lightboxImage.src = item.dataset.full;
      lightboxImage.alt = image.alt;
      lightbox.showModal();
    });
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('close', () => { lightboxImage.src = ''; });

  const form = document.querySelector('#booking-form');
  const formStatus = document.querySelector('#form-status');
  const dateField = form.elements.date;
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateField.min = localToday;

  const fieldFor = (control) => control.closest('.field');
  const validateControl = (control) => {
    const field = fieldFor(control);
    const message = field.querySelector('.field-error');
    let error = '';
    if (control.validity.valueMissing) error = 'Заполните это поле.';
    else if (control.name === 'name' && control.value.trim().length < 2) error = 'Укажите имя не короче двух символов.';
    else if (control.name === 'phone' && !/^[+()0-9\s-]{7,}$/.test(control.value.trim())) error = 'Введите номер телефона цифрами.';
    else if (control.name === 'date' && control.value < localToday) error = 'Выберите сегодняшнюю или будущую дату.';
    else if (!control.checkValidity()) error = 'Проверьте введённое значение.';
    field.classList.toggle('invalid', Boolean(error));
    control.setAttribute('aria-invalid', String(Boolean(error)));
    message.textContent = error;
    return !error;
  };

  [...form.elements].filter((control) => control.matches('input, select')).forEach((control) => {
    control.addEventListener('blur', () => validateControl(control));
    control.addEventListener('input', () => {
      if (control.getAttribute('aria-invalid') === 'true') validateControl(control);
      formStatus.hidden = true;
    });
    control.addEventListener('change', () => {
      if (control.getAttribute('aria-invalid') === 'true') validateControl(control);
      formStatus.hidden = true;
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const controls = [...form.elements].filter((control) => control.matches('input, select'));
    const valid = controls.map(validateControl).every(Boolean);
    if (!valid) {
      formStatus.hidden = true;
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    formStatus.textContent = `Демо-подтверждение: ${form.elements.name.value.trim()}, ${form.elements.date.value} в ${form.elements.time.value}, гостей: ${form.elements.guests.value}. Данные никуда не отправлены; для реальной записи нужен действующий контакт комплекса.`;
    formStatus.hidden = false;
  });
})();
