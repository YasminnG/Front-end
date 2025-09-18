// script.js (versão corrigida / com tratamento de erros e pt-BR)
const API_KEY = "api_key=ec332d19e6fed067df0160ce34067cc4"; // sua chave (mesma forma que você usava)
const BASE_URL = "https://api.themoviedb.org/3";

// endpoints com language=pt-BR
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}&language=pt-BR`;
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const SEARCH_URL = `${BASE_URL}/search/movie?${API_KEY}&language=pt-BR`;

// gêneros traduzidos (mantive o array local para gerar os botões)
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

const main = document.getElementById("main");
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
  if (loader) loader.style.display = "none"; // esconder loader ao carregar
});

// garante rótulos em pt-BR mesmo se o HTML estiver em inglês
if (search) search.placeholder = "Buscar filme";
if (prev) prev.innerHTML = "&#8656; Anterior";
if (next) next.innerHTML = "Próximo &#8658;";
const gateremarkLink = document.querySelector(".gateremark");
if (gateremarkLink) gateremarkLink.textContent = "por gateremark";

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
      if (selectedGenre.length == 0) {
        selectedGenre.push(genre.id);
      } else {
        if (selectedGenre.includes(genre.id)) {
          selectedGenre.forEach((id, idx) => {
            if (id == genre.id) {
              selectedGenre.splice(idx, 1);
            }
          });
        } else {
          selectedGenre.push(genre.id);
        }
      }
      // ao filtrar, garante language no endpoint (API_URL já contém language)
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
  if (selectedGenre.length != 0) {
    selectedGenre.forEach((id) => {
      const hightlightedTag = document.getElementById(id);
      if (hightlightedTag) hightlightedTag.classList.add("highlight");
    });
  }
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

// busca filmes (com tratamento de erros)
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

function showMovies(data) {
  if (!main) return;
  main.innerHTML = "";

  data.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie;
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    const imgSrc = poster_path ? IMAGE_URL + poster_path : "http://via.placeholder.com/1080x1580";

    const safeOverview = overview ? overview : "Sem descrição disponível.";

    movieEl.innerHTML = `
      <img src="${imgSrc}" alt="${title || ""}">
      <div class="movie-info">
        <h3>${title || movie.original_title || "Sem título"}</h3>
        <span class="${getColor(vote_average)}">${vote_average ?? "N/A"}</span>
      </div>
      <div class="overview">
        <h3>Descrição</h3>
        ${safeOverview}
        <br/>
        <button class="know-more" id="btn-${id}">Ver mais</button>
      </div>
    `;

    main.appendChild(movieEl);

    // adiciona listener no botão criado (id prefixado para evitar conflito)
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.addEventListener("click", () => {
        openNav(movie);
      });
    }
  });
}

const overlayContent = document.getElementById("overlay-content");

// abre overlay: busca detalhes (pt-BR) + vídeos
async function openNav(movie) {
  const id = movie.id;
  if (!overlayContent) return;

  // Show overlay immediately (so user sees feedback)
  document.getElementById("myNav").style.width = "100%";
  overlayContent.innerHTML = `<h1 class="no-results">Carregando...</h1>`;

  try {
    const [detailResp, videoResp] = await Promise.all([
      fetch(`${BASE_URL}/movie/${id}?${API_KEY}&language=pt-BR`),
      fetch(`${BASE_URL}/movie/${id}/videos?${API_KEY}&language=pt-BR`),
    ]);

    if (!detailResp.ok) throw new Error("Erro ao buscar detalhes: " + detailResp.status);
    if (!videoResp.ok) throw new Error("Erro ao buscar vídeos: " + videoResp.status);

    const detailData = await detailResp.json();
    const videoData = await videoResp.json();

    // monta vídeos (YouTube)
    let embed = [];
    let dots = [];
    if (videoData && videoData.results && videoData.results.length > 0) {
      videoData.results.forEach((video, idx) => {
        const { name, key, site } = video;
        if (site === "YouTube") {
          embed.push(`
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" title="${name}" class="embed hide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          `);
          dots.push(`<span class="dot">${idx + 1}</span>`);
        }
      });
    }

    const title = detailData.title || detailData.original_title || movie.title || "Sem título";
    const overview = detailData.overview || "Sem descrição disponível.";
    const genresList = detailData.genres ? detailData.genres.map((g) => g.name).join(", ") : "";

    let content = `
      <h1 class="no-results">${title}</h1>
      <p><strong>Gêneros:</strong> ${genresList}</p>
      <p>${overview}</p>
      <br/>
      ${embed.join("")}
      <br/>
      <div class="dots">${dots.join("")}</div>
    `;

    if (embed.length === 0) {
      content = `
        <h1 class="no-results">${title}</h1>
        <p><strong>Gêneros:</strong> ${genresList}</p>
        <p>${overview}</p>
        <br/>
        <h3>Nenhum vídeo encontrado</h3>
      `;
    }

    overlayContent.innerHTML = content;
    activeSlide = 0;
    showVideos();
  } catch (err) {
    console.error("Erro no overlay:", err);
    overlayContent.innerHTML = `<h1 class="no-results">Erro ao carregar o conteúdo. Veja o console (F12).</h1>`;
  }
}

/* fecha overlay */
function closeNav() {
  const nav = document.getElementById("myNav");
  if (nav) nav.style.width = "0%";
}

let activeSlide = 0;
let totalVideos = 0;

function showVideos() {
  let embedClasses = document.querySelectorAll(".embed");
  let dots = document.querySelectorAll(".dot");

  totalVideos = embedClasses.length;
  embedClasses.forEach((embedTag, idx) => {
    if (activeSlide == idx) {
      embedTag.classList.add("show");
      embedTag.classList.remove("hide");
    } else {
      embedTag.classList.add("hide");
      embedTag.classList.remove("show");
    }
  });

  dots.forEach((dot, indx) => {
    if (activeSlide == indx) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");

if (leftArrow) {
  leftArrow.addEventListener("click", () => {
    if (activeSlide > 0) activeSlide--;
    else activeSlide = totalVideos - 1;
    showVideos();
  });
}

if (rightArrow) {
  rightArrow.addEventListener("click", () => {
    if (activeSlide < totalVideos - 1) activeSlide++;
    else activeSlide = 0;
    showVideos();
  });
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
  let lastParam = queryParams[queryParams.length - 1].split("=");
  if (lastParam[0] != "page") {
    let url = lastUrl + "&page=" + page;
    getMovies(url);
  } else {
    lastParam[1] = page.toString();
    queryParams[queryParams.length - 1] = lastParam.join("=");
    let b = queryParams.join("&");
    let url = urlSplit[0] + "?" + b;
    getMovies(url);
  }
}

// inicializa busca
getMovies(API_URL);
