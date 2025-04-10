document.addEventListener('DOMContentLoaded', () => {
    // Navegación: Alternar pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const bottomButtons = document.querySelectorAll('.bottom-button');
    const tabContents = document.querySelectorAll('.tab-content');
  
    function showTab(tabId) {
      tabContents.forEach(tab => {
        tab.classList.toggle('active', tab.id === tabId);
      });
    }
  
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        showTab(button.getAttribute('data-tab'));
      });
    });
  
    bottomButtons.forEach(button => {
      button.addEventListener('click', () => {
        showTab(button.getAttribute('data-tab'));
      });
    });
  
    // Muestra "Inicio" por defecto
    showTab('home');
  
    /* Pestaña "Consejos": Cargar varios consejos y filtrarlos */
    const loadRandomAdviceBtn = document.getElementById('loadRandomAdvice');
    const adviceListDiv = document.getElementById('adviceList');
    let adviceItems = [];
  
    loadRandomAdviceBtn.addEventListener('click', async () => {
      adviceListDiv.innerHTML = 'Cargando consejos...';
      adviceItems = [];
      try {
        let advicePromises = [];
        for (let i = 0; i < 5; i++) {
          advicePromises.push(fetch('https://api.adviceslip.com/advice').then(res => res.json()));
        }
        let advices = await Promise.all(advicePromises);
        adviceListDiv.innerHTML = '';
        advices.forEach(data => {
          const adviceText = data.slip.advice;
          adviceItems.push(adviceText);
          const adviceDiv = document.createElement('div');
          adviceDiv.className = 'advice-item';
          adviceDiv.innerHTML = `<span>${adviceText}</span>
                                 <button onclick="addFavorite('${encodeURIComponent(adviceText)}')">Fav</button>`;
          adviceListDiv.appendChild(adviceDiv);
        });
      } catch (error) {
        adviceListDiv.innerHTML = 'Error al cargar consejos.';
      }
    });
  
    /* Filtrar consejos en "Consejos" */
    const filterInput = document.getElementById('filterInput');
    const applyFilterBtn = document.getElementById('applyFilter');
    const filteredAdviceDiv = document.getElementById('filteredAdviceList');
  
    applyFilterBtn.addEventListener('click', () => {
      const keyword = filterInput.value.toLowerCase();
      filteredAdviceDiv.innerHTML = '';
      const filtered = adviceItems.filter(advice => advice.toLowerCase().includes(keyword));
      if (filtered.length === 0) {
        filteredAdviceDiv.innerHTML = 'No se encontraron consejos que coincidan.';
      } else {
        filtered.forEach(advice => {
          const div = document.createElement('div');
          div.className = 'advice-item';
          div.textContent = advice;
          filteredAdviceDiv.appendChild(div);
        });
      }
    });
  
    /* Buscar consejos en "Buscar" */
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchResultsDiv = document.getElementById('searchResults');
  
    searchButton.addEventListener('click', async () => {
      const query = searchInput.value.trim();
      if (query === '') {
        searchResultsDiv.innerHTML = 'Por favor, ingresa una palabra clave.';
        return;
      }
      searchResultsDiv.innerHTML = 'Buscando...';
      try {
        const response = await fetch(`https://api.adviceslip.com/advice/search/${query}`);
        const data = await response.json();
        searchResultsDiv.innerHTML = '';
  
        if (data.slips) {
          data.slips.forEach(item => {
            const div = document.createElement('div');
            div.className = 'advice-item';
            div.innerHTML = `<span>${item.advice}</span>
                             <button onclick="addFavorite('${encodeURIComponent(item.advice)}')">Fav</button>`;
            searchResultsDiv.appendChild(div);
          });
        } else {
          searchResultsDiv.innerHTML = 'No se encontraron resultados.';
        }
      } catch (error) {
        searchResultsDiv.innerHTML = 'Error en la búsqueda.';
      }
    });
  
    /* Pestaña "Favoritos": CRUD con localStorage */
    function loadFavorites() {
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      const favoritesListDiv = document.getElementById('favoritesList');
      favoritesListDiv.innerHTML = '';
      favorites.forEach((fav, index) => {
        const div = document.createElement('div');
        div.className = 'favorite-item';
        div.innerHTML = `<span>${fav}</span>
                         <button onclick="deleteFavorite(${index})">Eliminar</button>`;
        favoritesListDiv.appendChild(div);
      });
    }
  
    window.addFavorite = function(adviceEncoded) {
      const advice = decodeURIComponent(adviceEncoded);
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favorites.push(advice);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert('Consejo agregado a favoritos');
      loadFavorites();
    };
  
    document.getElementById('addFavoriteManual').addEventListener('click', () => {
      const manualInput = document.getElementById('favoriteManual').value.trim();
      if (manualInput !== '') {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.push(manualInput);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Consejo agregado a favoritos');
        document.getElementById('favoriteManual').value = '';
        loadFavorites();
      }
    });
  
    loadFavorites(); // Asegura cargar los favoritos al iniciar la página
  });