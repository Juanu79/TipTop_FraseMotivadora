document.addEventListener('DOMContentLoaded', () => {
    // Alternar pestañas (Navegación superior e inferior)
    const tabButtons = document.querySelectorAll('.tab-button, .bottom-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function showTab(tabId) {
        tabContents.forEach(tab => tab.classList.toggle('active', tab.id === tabId));
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => showTab(button.getAttribute('data-tab')));
    });

    showTab('home'); // Muestra "Inicio" por defecto

    // Cargar consejos aleatorios
    const loadRandomAdviceBtn = document.getElementById('loadRandomAdvice');
    const adviceListDiv = document.getElementById('adviceList');
    let adviceItems = [];

    loadRandomAdviceBtn.addEventListener('click', async () => {
        adviceListDiv.innerHTML = 'Cargando consejos...';
        adviceItems = [];

        try {
            const advicePromises = Array.from({ length: 5 }, () =>
                fetch('https://api.adviceslip.com/advice').then(res => res.json())
            );
            const advices = await Promise.all(advicePromises);

            adviceListDiv.innerHTML = advices.map(data => {
                const adviceText = data.slip.advice;
                adviceItems.push(adviceText);
                return `<div class="advice-item">
                            <span>${adviceText}</span>
                            <button onclick="addFavorite('${encodeURIComponent(adviceText)}')">Fav</button>
                        </div>`;
            }).join('');
        } catch (error) {
            adviceListDiv.innerHTML = 'Error al cargar consejos.';
        }
    });

    // Filtrar consejos
    document.getElementById('applyFilter').addEventListener('click', () => {
        const keyword = document.getElementById('filterInput').value.toLowerCase();
        const filteredAdviceDiv = document.getElementById('filteredAdviceList');

        filteredAdviceDiv.innerHTML = adviceItems.length
            ? adviceItems.filter(advice => advice.toLowerCase().includes(keyword))
                      .map(advice => `<div class="advice-item">${advice}</div>`)
                      .join('')
            : 'No se encontraron consejos que coincidan.';
    });

    // Buscar consejos en API
    document.getElementById('searchButton').addEventListener('click', async () => {
        const query = document.getElementById('searchInput').value.trim();
        const searchResultsDiv = document.getElementById('searchResults');

        if (!query) return (searchResultsDiv.innerHTML = 'Por favor, ingresa una palabra clave.');

        try {
            const response = await fetch(`https://api.adviceslip.com/advice/search/${query}`);
            const data = await response.json();
            searchResultsDiv.innerHTML = data.slips
                ? data.slips.map(item => `<div class="advice-item">
                                            <span>${item.advice}</span>
                                            <button onclick="addFavorite('${encodeURIComponent(item.advice)}')">Fav</button>
                                        </div>`).join('')
                : 'No se encontraron resultados.';
        } catch (error) {
            searchResultsDiv.innerHTML = 'Error en la búsqueda.';
        }
    });

    // Favoritos: CRUD con localStorage
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

    document.getElementById('addFavoriteManual').addEventListener('click', () => {
        const manualInput = document.getElementById('favoriteManual').value.trim();
        if (!manualInput) return;

        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.push(manualInput);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        alert('Consejo agregado a favoritos');
        document.getElementById('favoriteManual').value = '';
        loadFavorites();
    });

    loadFavorites(); // Cargar favoritos al iniciar

    // Mostrar información de la API (nuevo cuadro externo)
    const apiInfoSection = document.getElementById('api-info');
    if (apiInfoSection) {
        apiInfoSection.innerHTML = `
            <img src="Imagenes/api-banner.png" alt="Descripción de la API">
            <h2>¿Cómo funciona la Advice Slip API?</h2>
            <p>La <strong>Advice Slip API</strong> es un servicio que permite obtener consejos aleatorios 
            de manera rápida y sencilla. Se usa en esta aplicación para generar frases motivadoras 
            cada día.</p>
            <p>Puedes buscar, filtrar y marcar como favoritos los consejos para guardarlos y volver 
            a verlos cuando lo necesites.</p>
            <hr>
            <p><strong>GitHub:</strong> <a href="https://github.com/Juanu79" target="_blank">Juanu79</a></p>
            <p><strong>Versión:</strong> v.1.0.0</p>
        `;
    }
});
