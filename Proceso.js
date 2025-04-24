document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button, .bottom-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const apiInfoSection = document.getElementById('api-info');

    function showTab(tabId) {
      tabContents.forEach(tab => tab.classList.toggle('active', tab.id === tabId));
      if (apiInfoSection) apiInfoSection.style.display = tabId === "home" ? "block" : "none";
      if (tabId === "buscar") {
        setTimeout(() => document.getElementById('searchInput')?.focus(), 300);
      }
    }

    tabButtons.forEach(button => {
      button.addEventListener('click', () => showTab(button.getAttribute('data-tab')));
    });

    showTab('home');

    const loadRandomAdviceBtn = document.getElementById('loadRandomAdvice');
    const adviceListDiv = document.getElementById('adviceList');
    let adviceItems = [];

    loadRandomAdviceBtn?.addEventListener('click', async () => {
      adviceListDiv.innerHTML = 'Cargando consejos...';
      adviceItems = [];

      try {
        const advicePromises = Array.from({ length: 5 }, () => fetch('https://api.adviceslip.com/advice').then(res => res.json()));
        const advices = await Promise.all(advicePromises);

        adviceListDiv.innerHTML = advices.map(data => {
          const adviceText = data.slip.advice;
          adviceItems.push(adviceText);
          return `<div class="advice-item">
                    <span>${adviceText}</span>
                    <button onclick="addFavorite('${encodeURIComponent(adviceText)}')">Fav</button>
                  </div>`;
        }).join('');
      } catch {
        adviceListDiv.innerHTML = 'Error al cargar consejos.';
      }
    });

    document.getElementById('applyFilter')?.addEventListener('click', () => {
      const keyword = document.getElementById('filterInput').value.toLowerCase();
      const filteredAdviceDiv = document.getElementById('filteredAdviceList');

      filteredAdviceDiv.innerHTML = adviceItems.length
        ? adviceItems.filter(advice => advice.toLowerCase().includes(keyword))
                      .map(advice => `<div class="advice-item">${advice}</div>`)
                      .join('')
        : 'No se encontraron consejos que coincidan.';
    });

    document.getElementById('searchButton')?.addEventListener('click', async () => {
      const query = document.getElementById('searchInput').value.trim();
      const searchResultsDiv = document.getElementById('searchResults');

      if (!query) return searchResultsDiv.innerHTML = 'Por favor, ingresa una palabra clave.';

      searchResultsDiv.innerHTML = 'Buscando...';

      try {
        const response = await fetch(`https://api.adviceslip.com/advice/search/${query}`);
        const data = await response.json();

        searchResultsDiv.innerHTML = data.slips
          ? data.slips.map(item => `<div class="advice-item">
                                      <span>${item.advice}</span>
                                      <button onclick="addFavorite('${encodeURIComponent(item.advice)}')">Fav</button>
                                    </div>`).join('')
          : 'No se encontraron resultados.';
      } catch {
        searchResultsDiv.innerHTML = 'Error en la búsqueda.';
      }
    });

    const desafios = [
      "Haz una lista de tus logros esta semana.",
      "Escribe una nota positiva para ti y pégala donde la veas.",
      "Realiza una acción amable hacia alguien sin decirle.",
      "Dedica 10 minutos a meditar o respirar profundo.",
      "Empieza el día con una meta clara y pequeña."
    ];

    document.getElementById('loadDesafio')?.addEventListener('click', () => {
      const randomDesafio = desafios[Math.floor(Math.random() * desafios.length)];
      document.getElementById('desafioContent').innerHTML = `<p>${randomDesafio}</p>`;
    });

    function loadFavorites() {
      const favoritesListDiv = document.getElementById('favoritesList');
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

      favoritesListDiv.innerHTML = favorites.length
        ? favorites.map((fav, index) => `<div class="favorite-item">
                                           <span>${fav}</span>
                                           <button onclick="deleteFavorite(${index})">Eliminar</button>
                                         </div>`).join('')
        : 'No tienes favoritos aún.';
    }

    window.addFavorite = adviceEncoded => {
      const advice = decodeURIComponent(adviceEncoded);
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favorites.push(advice);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert('Consejo agregado a favoritos');
      loadFavorites();
    };

    window.deleteFavorite = index => {
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      loadFavorites();
    };

    document.getElementById('addFavoriteManual')?.addEventListener('click', () => {
      const manualInput = document.getElementById('favoriteManual').value.trim();
      if (!manualInput) return;

      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favorites.push(manualInput);
      localStorage.setItem('favorites', JSON.stringify(favorites));

      alert('Consejo agregado a favoritos');
      document.getElementById('favoriteManual').value = '';
      loadFavorites();
    });

    loadFavorites();
  });
