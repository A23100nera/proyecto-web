const API_KEY = '2167d9d0456b448d89e99d24212ab962'; 
const BASE_URL = 'https://api.rawg.io/api/games';

// Confirmación en consola
console.log("Sistema Nexus Games: En línea");

document.addEventListener('DOMContentLoaded', () => {
    fetchGames(); // Carga inicial

    const ratingRange = document.getElementById('rating-range');
    const ratingVal = document.getElementById('rating-val');

    ratingRange.addEventListener('input', (e) => {
        ratingVal.innerText = parseFloat(e.target.value).toFixed(1);
    });

    document.getElementById('filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
    });
});

async function fetchGames(params = '') {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-blue-400 animate-pulse font-bold tracking-widest uppercase text-sm">Sincronizando Base de Datos...</p>
        </div>`;

    try {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}${params}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            renderGames(data.results);
        } else {
            grid.innerHTML = '<p class="col-span-full text-center text-slate-500 py-20 text-lg">No se encontraron juegos con esos filtros. 🕹️</p>';
        }
    } catch (error) {
        grid.innerHTML = '<p class="col-span-full text-center text-red-400 py-20 font-bold">Error de conexión. Intenta de nuevo más tarde.</p>';
    }
}

function renderGames(games) {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = '';
    const minRating = parseFloat(document.getElementById('rating-range').value);

    games.forEach(game => {
        if (game.rating < minRating) return;

        const card = document.createElement('div');
        card.className = "group bg-slate-800/40 rounded-3xl overflow-hidden border border-slate-700/50 flex flex-col w-full cursor-pointer hover:border-blue-500 transition-all shadow-xl";
        
        card.onclick = () => openGameDetails(game.id);

        card.innerHTML = `
            <div class="relative h-48 overflow-hidden">
                <img src="${game.background_image || 'https://via.placeholder.com/600x400'}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="${game.name}">
                <div class="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-full text-blue-400 text-xs font-bold border border-white/10">
                    ★ ${game.rating.toFixed(1)}
                </div>
            </div>
            <div class="p-5">
                <h3 class="text-white font-bold group-hover:text-blue-400 transition-colors line-clamp-1">${game.name}</h3>
                <p class="text-[10px] text-blue-300 mt-2 uppercase font-bold tracking-widest">Ver resumen completo</p>
                <div class="mt-4 flex flex-wrap gap-2">
                    ${game.genres.slice(0, 2).map(g => `<span class="text-[9px] text-slate-500 italic">#${g.name}</span>`).join('')}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function openGameDetails(gameId) {
    const modal = document.getElementById('game-modal');
    const content = document.getElementById('modal-content');
    
    modal.classList.remove('hidden');
    content.innerHTML = `
        <div class="text-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-slate-400 text-xs uppercase tracking-widest">Consultando expediente...</p>
        </div>`;

    try {
        const response = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`);
        const game = await response.json();

        content.innerHTML = `
            <div class="flex flex-col gap-4">
                <h2 class="text-3xl font-black text-blue-400 leading-none">${game.name}</h2>
                
                <div class="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700/50 pb-4">
                    <span>📅 Lanzamiento: ${game.released || 'Por anunciar'}</span>
                    <span>🏆 Puntuación: ${game.rating}/5</span>
                </div>

                <div class="text-slate-300 text-sm leading-relaxed max-h-60 overflow-y-auto custom-scroll pr-3 my-2">
                    ${game.description || "No hay una descripción disponible en español para este título."}
                </div>

                <div class="flex flex-col sm:flex-row gap-4 mt-4 items-center">
                    <button onclick="closeModal()" class="w-full sm:w-1/3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-3 rounded-xl transition-all">
                        VOLVER
                    </button>
                    ${game.website ? `
                        <a href="${game.website}" target="_blank" class="w-full sm:w-2/3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all text-center">
                            VISITAR WEB OFICIAL
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = '<p class="text-red-400 text-center font-bold">Error al cargar los detalles del juego.</p>';
    }
}

function closeModal() {
    document.getElementById('game-modal').classList.add('hidden');
}

window.onclick = function(event) {
    const modal = document.getElementById('game-modal');
    if (event.target == modal) closeModal();
}

function applyFilters() {
    const search = document.getElementById('name-input').value;
    const platform = document.getElementById('platform-select').value;
    const genres = Array.from(document.querySelectorAll('.genre-cb:checked')).map(cb => cb.value).join(',');
    
    let query = `&page_size=16`; // Mostramos 16 juegos por búsqueda
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (platform) query += `&platforms=${platform}`;
    if (genres) query += `&genres=${genres}`;
    
    fetchGames(query);
}
