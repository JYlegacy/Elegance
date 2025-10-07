
document.addEventListener('DOMContentLoaded', () => {
  const catalogo = document.getElementById('catalogo');
  const lightbox = document.getElementById('lightbox');
  const img = lightbox.querySelector('img');
  const prev = lightbox.querySelector('.prev');
  const next = lightbox.querySelector('.next');
  const closeBtn = lightbox.querySelector('.close');
  const thumbsContainer = document.getElementById('thumbnails');

  let images = [];
  let currentIndex = 0;

  // Combinar todos os itens dos arquivos externos
  const todosItens = [
    ...itensRelogios,
    ...itensJoias,
    ...itensSemiJoias,
    ...itensSapatos
  ];

  // Montar catálogo
  catalogo.innerHTML = todosItens.map(item => `
	<article class="item" data-category="${item.categoria}" data-images='${JSON.stringify(item.imagens)}'>
		<div class="thumb" style="background-image:url('${item.thumb}')"></div>
		<h3>${item.titulo}</h3>
		<div class="meta">${item.meta}</div>
		<div class="price">${item.preco}</div>
		<button class="ver-produto">Ver produto</button>
	</article>
	`).join("");

  // Seleciona botões e itens *de dentro do catálogo* (após montagem)
  const buttons = Array.from(document.querySelectorAll('.categorias button'));
  const items = Array.from(catalogo.querySelectorAll('.item'));

  function setActiveButton(targetBtn) {
    buttons.forEach(b => b.classList.toggle('active', b === targetBtn));
  }

  // Usa style.display para esconder (mais robusto que depender de uma classe .hide)
  function filterCategory(cat) {
    items.forEach(it => {
      const c = it.dataset.category;
      it.style.display = (cat === 'todos' || c === cat) ? '' : 'none';
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton(btn);
      filterCategory(btn.dataset.filter);
    });
  });

  // Ativa o botão "todos" por padrão (se existir)
  const defaultBtn = document.querySelector('.categorias button[data-filter="todos"]');
  if (defaultBtn) defaultBtn.click();

  // Lightbox
  function showImage(i) {
    if (!images || !images.length) return;
    currentIndex = (i + images.length) % images.length;
    img.src = images[currentIndex];
    const thumbs = thumbsContainer.querySelectorAll('img');
    thumbs.forEach((t, idx) => t.classList.toggle('active', idx === currentIndex));
  }

  // Delegação de clique no catálogo (funciona mesmo se houver mudanças)
  catalogo.addEventListener('click', (e) => {
    const it = e.target.closest('.item');
    if (!it) return;
    images = JSON.parse(it.dataset.images || '[]');
    currentIndex = 0;
    if (images.length) {
      img.src = images[0];
      thumbsContainer.innerHTML = images.map((src, idx) => `<img src="${src}" data-index="${idx}">`).join('');
      lightbox.classList.add('active');
      showImage(0);
    }
  });

  prev.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
  next.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });
  closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) lightbox.classList.remove('active');
  });

  thumbsContainer.addEventListener('click', e => {
    if (e.target && e.target.tagName === 'IMG') showImage(parseInt(e.target.dataset.index, 10));
  });
  
// ===== BANNER ROTATIVO =====
const slides = document.querySelectorAll('.banner-slide');
const prevBtn = document.querySelector('.banner-prev');
const nextBtn = document.querySelector('.banner-next');
const dotsContainer = document.querySelector('.banner-dots');
let slideIndex = 0;
let bannerInterval;

// Criar pontinhos dinamicamente
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => {
    stopAutoSlide();
    showSlide(i);
    startAutoSlide();
  });
  dotsContainer.appendChild(dot);
});
const dots = dotsContainer.querySelectorAll('button');

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
    dots[i].classList.toggle('active', i === index);
  });
  slideIndex = index;
}

function nextSlide() {
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}

function prevSlide() {
  slideIndex = (slideIndex - 1 + slides.length) % slides.length;
  showSlide(slideIndex);
}

function startAutoSlide() {
  bannerInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
  clearInterval(bannerInterval);
}

nextBtn.addEventListener('click', () => {
  stopAutoSlide();
  nextSlide();
  startAutoSlide();
});

prevBtn.addEventListener('click', () => {
  stopAutoSlide();
  prevSlide();
  startAutoSlide();
});

showSlide(slideIndex);
startAutoSlide();

// Suporte a swipe no banner para mobile
let touchStartX = 0;
let touchEndX = 0;

const bannerContainer = document.querySelector('.banner-container');

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const swipeThreshold = 50;
  
  if (touchEndX < touchStartX - swipeThreshold) {
    // Swipe left - next
    stopAutoSlide();
    nextSlide();
    startAutoSlide();
  }
  
  if (touchEndX > touchStartX + swipeThreshold) {
    // Swipe right - prev
    stopAutoSlide();
    prevSlide();
    startAutoSlide();
  }
}

// Adicionar event listeners para swipe
if (bannerContainer) {
  bannerContainer.addEventListener('touchstart', handleTouchStart, false);
  bannerContainer.addEventListener('touchend', handleTouchEnd, false);
}

// Otimização de performance para mobile
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Aplicar throttle em eventos de resize
window.addEventListener('resize', throttle(function() {
  // Recalculos necessários se precisar
}, 250));

function optimizeForMobile() {
  // Detecta se é mobile
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Otimizações específicas para mobile
    document.body.classList.add('mobile-device');
    
    // Ajusta o comportamento do lightbox para touch
    lightbox.style.touchAction = 'pan-y';
    
    // Melhora o performance do scroll
    document.addEventListener('touchmove', function(e) {
      if (e.scale !== 1) e.preventDefault();
    }, { passive: false });
  }
}

});
