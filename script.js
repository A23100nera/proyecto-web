const API_KEY = '2167d9d0456b448d89e99d24212ab962'; 
const BASE_URL = 'https://api.rawg.io/api/games';

const gameGrid = document.getElementById('results-grid');
const filterForm = document.getElementById('filter-form');
const ratingRange = document.getElementById('rating-range');
const ratingVal = document.getElementById('rating-val');

document.addEventListener('DOMContentLoaded', () => {
    fetchGames(); // Carga inicial

    ratingRange.addEventListener('input', (e) => {
        ratingVal.innerText = parseFloat(e.target.value).toFixed(1);
    });

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
    });
});

async function fetchGames(params = '') {
    gameGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p class="text-slate-400 animate-pulse font-medium">Sincronizando con RAWG Database...</p>
        </div>
    `;

    try {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}${params}`);
        if (!response.ok) throw new Error('Error en API');
        const data = await response.json();
        
        if (data.results.length === 0) {
            gameGrid.innerHTML = '<p class="col-span-full text-center text-slate-500 py-10">No hay resultados para estos criterios. 🕹️</p>';
        } else {
            renderGames(data.results);
        }
    } catch (error) {
        gameGrid.innerHTML = '<p class="col-span-full text-center text-red-400 py-10">Error de conexión. Verifica tu conexión o API Key.</p>';
    }
}

function applyFilters() {
    const search = document.getElementById('name-input').value;
    const platform = document.getElementById('platform-select').value;
    const startDate = document.getElementById('date-input').value;
    const genres = Array.from(document.querySelectorAll('.genre-cb:checked')).map(cb => cb.value).join(',');

    let queryParams = `&page_size=15`;
    if (search) queryParams += `&search=${encodeURIComponent(search)}`;
    if (platform) queryParams += `&platforms=${platform}`;
    if (genres) queryParams += `&genres=${genres}`;
    if (startDate) queryParams += `&dates=${startDate},2026-12-31`;

    fetchGames(queryParams);
}

function renderGames(games) {
    gameGrid.innerHTML = '';
    const minRating = parseFloat(ratingRange.value);

    games.forEach(game => {
        // Filtrado por rating
        if (game.rating < minRating) return;

        const card = document.createElement('div');
       card.className = "group bg-slate-800/40 rounded-3xl overflow-hidden border border-slate-700/50 flex flex-col w-full";
        
        // 6 ENTIDADES REPRESENTADAS:
        // 1. Imagen | 2. Nombre | 3. Rating | 4. Fecha | 5. Géneros | 6. Plataformas
        card.innerHTML = `
            <div class="relative h-52 overflow-hidden">
                <img src="${game.background_image || 'https://via.placeholder.com/600x400'}" 
                     class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span class="text-blue-400 font-bold text-xs uppercase">★ ${game.rating.toFixed(1)}</span>
                </div>
            </div>
            <div class="p-6 flex flex-col flex-1">
                <h3 class="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">${game.name}</h3>
                
                <div class="flex items-center gap-2 mb-4">
                    <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-900/50 px-2 py-1 rounded">
                        Lanzamiento: ${game.released || 'TBA'}
                    </span>
                </div>

                <div class="mb-4">
                    <p class="text-[9px] text-slate-500 font-bold uppercase mb-2">Plataformas:</p>
                    <div class="flex flex-wrap gap-1">
                        ${game.parent_platforms ? game.parent_platforms.map(p => `
                            <span class="text-[8px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-bold">
                                ${p.platform.name}
                            </span>
                        `).join('') : '---'}
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-700/30">
                    ${game.genres.slice(0, 2).map(g => `
                        <span class="text-slate-400 text-[10px] font-medium italic">#${g.name}</span>
                    `).join(' ')}
                </div>
            </div>
        `;
        gameGrid.appendChild(card);
    });
}