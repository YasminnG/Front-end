const API_KEY = "api_key=ec332d19e6fed067df0160ce34067cc4"; // sua chave
const BASE_URL = "https://api.themoviedb.org/3";

const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}&language=pt-BR`;
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const SEARCH_URL = `${BASE_URL}/search/movie?${API_KEY}&language=pt-BR`;

const genres = [
  { id: 28, name: "Ação" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animação" },
  { id: 35, name: "Comédia" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentário" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Família" },
  { id: 14, name: "Fantasia" },
  { id: 36, name: "História" },
  { id: 27, name: "Terror" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Mistério" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ficção Científica" },
  { id: 10770, name: "Filme de TV" },
  { id: 53, name: "Suspense" },
  { id: 10752, name: "Guerra" },
  { id: 37, name: "Faroeste" },
];

const main = document.getElementById("main" );
const form = document.getElementById("form");
const search = document.getElementById("search");
const tagsEl = document.getElementById("tags");

const prev = document.getElementById("prev");
const next = document.getElementById("next");
const current = document.getElementById("current");

let currentPage = 1;
let nextPage = 2;
let prevPage = 3;
let lastUrl = "";
let totalPages = 100;

window.addEventListener("load", function () {
  let loader = document.querySelector(".loader");
  if (loader) loader.style.display = "none";
});

if (search) search.placeholder = "Buscar filme";
if (prev) prev.innerHTML = "&#8656; Anterior";
if (next) next.innerHTML = "Próximo &#8658;";

let selectedGenre = [];
setGenre();

function setGenre() {
  if (!tagsEl) return;
  tagsEl.innerHTML = "";
  genres.forEach((genre) => {
    const t = document.createElement("div");
    t.classList.add("tag");
    t.id = genre.id;
    t.innerText = genre.name;
    t.addEventListener("click", () => {
      if (selectedGenre.includes(genre.id)) {
        selectedGenre = selectedGenre.filter((id) => id !== genre.id);
      } else {
        selectedGenre.push(genre.id);
      }
      getMovies(API_URL + "&with_genres=" + encodeURI(selectedGenre.join(",")));
      highlightSelection();
    });
    tagsEl.append(t);
  });
}

function highlightSelection() {
  const tags = document.querySelectorAll(".tag");
  tags.forEach((tag) => tag.classList.remove("highlight"));
  clearBtn();
  selectedGenre.forEach((id) => {
    const highlightedTag = document.getElementById(id);
    if (highlightedTag) highlightedTag.classList.add("highlight");
  });
}

function clearBtn() {
  let clearBtn = document.getElementById("clear");
  if (clearBtn) {
    clearBtn.classList.add("highlight");
  } else {
    let clear = document.createElement("div");
    clear.classList.add("tag", "highlight");
    clear.id = "clear";
    clear.innerText = "Limpar ✖";
    clear.addEventListener("click", () => {
      selectedGenre = [];
      setGenre();
      getMovies(API_URL);
    });
    if (tagsEl) tagsEl.append(clear);
  }
}

function getMovies(url) {
  lastUrl = url;
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("HTTP error: " + res.status);
      return res.json();
    })
    .then((data) => {
      if (data && Array.isArray(data.results) && data.results.length !== 0) {
        showMovies(data.results);
        currentPage = data.page || 1;
        nextPage = currentPage + 1;
        prevPage = currentPage - 1;
        totalPages = data.total_pages || totalPages;

        if (current) current.innerText = currentPage;

        if (currentPage <= 1) {
          if (prev) prev.classList.add("disabled");
          if (next) next.classList.remove("disabled");
        } else if (currentPage >= totalPages) {
          if (prev) prev.classList.remove("disabled");
          if (next) next.classList.add("disabled");
        } else {
          if (prev) prev.classList.remove("disabled");
          if (next) next.classList.remove("disabled");
        }

        if (tagsEl) tagsEl.scrollIntoView({ behavior: "smooth" });
      } else {
        if (main) main.innerHTML = `<h1 class="no-results">Nenhum resultado encontrado</h1>`;
      }
    })
    .catch((err) => {
      console.error("Erro ao buscar filmes:", err);
      if (main) main.innerHTML = `<h1 class="no-results">Erro ao carregar dados. Abra o console (F12).</h1>`;
    });
}

// ===================================================================
// FUNÇÃO ATUALIZADA PARA GERAR LINKS DE BUSCA DIRETA
// ===================================================================
async function getStreamingLink(movie) {
  const { id, title } = movie;
  const providersUrl = `${BASE_URL}/movie/${id}/watch/providers?${API_KEY}`;

  // Mapa de provedores para seus links de busca
  const searchLinks = {
    "Netflix": "https://www.netflix.com/search?q=",
    "Amazon Prime Video": "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=",
    "Max": "https://play.max.com/search?q=",
    "Disney Plus": "https://www.disneyplus.com/search?q=",
    "Star Plus": "https://www.starplus.com/search?q=",
    "Globoplay": "https://globoplay.globo.com/busca/?q=",
    "Paramount Plus": "https://www.paramountplus.com/search/?q=",
    "Apple TV Plus": "https://tv.apple.com/br/search?term=",
  };

  try {
    const res = await fetch(providersUrl );
    const data = await res.json();
    const providers = data.results.BR;

    if (providers && providers.flatrate && providers.flatrate.length > 0) {
      const primaryProvider = providers.flatrate[0];
      const providerName = primaryProvider.provider_name;

      if (searchLinks[providerName]) {
        const searchUrl = `${searchLinks[providerName]}${encodeURIComponent(title)}`;
        return `  
  
<a href="${searchUrl}" target="_blank" class="watch-link">Assistir na ${providerName}</a>`;
      } else {
        // Se o provedor não estiver no nosso mapa, usamos o link do JustWatch como fallback
        const fallbackLink = providers.link;
        return `  
  
<a href="${fallbackLink}" target="_blank" class="watch-link">Ver opções na ${providerName}</a>`;
      }
    } else {
      return `  
  
<span class="not-available">Não disponível em streaming por assinatura.</span>`;
    }
  } catch (error) {
    console.error("Erro ao buscar provedores:", error);
    return `  
  
<span class="not-available">Não foi possível verificar a disponibilidade.</span>`;
  }
}

async function showMovies(data) {
  if (!main) return;
  main.innerHTML = ""; // Limpa a área de filmes

  // Adiciona a atribuição ao JustWatch no final
  const attribution = document.createElement('div');
  attribution.style.textAlign = 'center';
  attribution.style.marginTop = '20px';
  attribution.style.fontSize = '12px';
  attribution.innerHTML = 'Streaming data provided by <a href="https://www.justwatch.com" target="_blank">JustWatch</a>.';


  for (const movie of data ) {
    const { title, poster_path, vote_average, overview } = movie;
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    const imgSrc = poster_path ? IMAGE_URL + poster_path : "http://via.placeholder.com/1080x1580";
    let safeOverview = overview ? overview : "Sem descrição disponível.";

    // Busca o link de streaming e o adiciona na descrição
    const streamingLink = await getStreamingLink(movie ); // Passa o objeto 'movie' inteiro
    safeOverview += streamingLink;

    movieEl.innerHTML = `
      <img src="${imgSrc}" alt="${title || ""}">
      <div class="movie-info">
        <h3>${title || movie.original_title || "Sem título"}</h3>
        <span class="${getColor(vote_average)}">${vote_average ? vote_average.toFixed(1) : "N/A"}</span>
      </div>
      <div class="overview">
        <h3>Descrição</h3>
        ${safeOverview}
      </div>
    `;

    main.appendChild(movieEl);
  }
   main.appendChild(attribution);
}


function getColor(vote) {
  if (!vote && vote !== 0) return "gray";
  if (vote >= 8) return "green";
  else if (vote >= 5) return "orange";
  else return "red";
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = search ? search.value : "";
    selectedGenre = [];
    setGenre();
    if (searchTerm) {
      getMovies(SEARCH_URL + "&query=" + encodeURIComponent(searchTerm));
    } else {
      getMovies(API_URL);
    }
  });
}

if (prev) {
  prev.addEventListener("click", () => {
    if (prevPage > 0) pageCall(prevPage);
  });
}
if (next) {
  next.addEventListener("click", () => {
    if (nextPage <= totalPages) pageCall(nextPage);
  });
}

function pageCall(page) {
  if (!lastUrl) return;
  let urlSplit = lastUrl.split("?");
  if (urlSplit.length <= 1) {
    getMovies(lastUrl + "&page=" + page);
    return;
  }
  let queryParams = urlSplit[1].split("&");
  let pageParamIndex = queryParams.findIndex(p => p.startsWith('page='));

  if (pageParamIndex !== -1) {
    queryParams[pageParamIndex] = "page=" + page;
  } else {
    queryParams.push("page=" + page);
  }

  let newUrl = urlSplit[0] + "?" + queryParams.join("&");
  getMovies(newUrl);
}

getMovies(API_URL);
