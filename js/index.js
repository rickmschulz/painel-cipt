// Variáveis globais do Carrossel
let slideAtual = 0;
let totalSlides = 0;
let listaImagens = [];

// Variáveis e Lógica para Expansão de Documentos
let docsExpandidos = false;

function inicializarDocumentos() {
    const grid = document.getElementById('documentos-grid');
    if (!grid) return;
    
    const itens = grid.children;
    const containerBtn = document.getElementById('container-btn-docs');

    // Se houver mais de 6 itens, esconde os excedentes e exibe o botão
    if (itens.length > 6) {
        containerBtn.classList.remove('hidden');
        for (let i = 6; i < itens.length; i++) {
            itens[i].classList.add('hidden', 'doc-extra');
        }
    } else {
        containerBtn.classList.add('hidden');
    }
}

function toggleDocumentos() {
    docsExpandidos = !docsExpandidos;
    
    const extras = document.querySelectorAll('.doc-extra');
    const btnTexto = document.getElementById('texto-btn-docs');
    const btnIcone = document.getElementById('icone-btn-docs');

    extras.forEach(el => {
        if (docsExpandidos) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    if (docsExpandidos) {
        btnTexto.innerText = "Ver menos documentos";
        btnIcone.setAttribute('data-lucide', 'chevron-up');
    } else {
        btnTexto.innerText = "Ver mais documentos";
        btnIcone.setAttribute('data-lucide', 'chevron-down');
    }
    
    // Re-renderiza o ícone específico que foi alterado
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Configuração de Status
const configsStatus = {
    'atrasado': { classes: 'bg-yellow-100 text-yellow-800', icone: 'alert-circle', texto: 'Atrasado' },
    'no_prazo': { classes: 'bg-green-100 text-green-800', icone: 'check-circle', texto: 'No Prazo' },
    'adiantado': { classes: 'bg-blue-100 text-blue-800', icone: 'trending-up', texto: 'Adiantado' }
};

// Função principal que busca e processa o JSON
async function carregarDados() {
    try {
        // Faz a requisição para pegar o arquivo json na mesma pasta
        const resposta = await fetch('dados.json');
        const dados = await resposta.json();

        const relatorio = document.getElementById('link-relatorio');
        if (relatorio && dados.links) relatorio.href = dados.links.relatorio_pdf;
        
        const cronograma = document.getElementById('link-cronograma');
        if (cronograma && dados.links) cronograma.href = dados.links.cronograma;

        // Atualizar o iframe do YouTube tratando o link do JSON
        const iframeYoutube = document.getElementById('link-evol-obra');
        if (iframeYoutube && dados.links && dados.links.evol_obra) {
            iframeYoutube.src = formatarUrlYoutube(dados.links.evol_obra);
        }

        // Atualizar Mês de Referência nos títulos
        if (document.getElementById('mes-ref-desktop')) {
            document.getElementById('mes-ref-desktop').innerText = dados.mes_referencia;
        }
        if (document.getElementById('mes-ref-mobile')) {
            document.getElementById('mes-ref-mobile').innerText = dados.mes_referencia;
        }

        // Atualizar Cartões Físicos
        if (document.getElementById('val-fis-prev-acum') && dados.indicadores) {
            document.getElementById('val-fis-prev-acum').innerText = dados.indicadores.fisico.previsto_acumulado;
            document.getElementById('val-fis-real-acum').innerText = dados.indicadores.fisico.realizado_acumulado;
            document.getElementById('val-fis-prev-mensal').innerText = dados.indicadores.fisico.previsto_mensal;
            document.getElementById('val-fis-real-mensal').innerText = dados.indicadores.fisico.realizado_mensal;
        }

        // Atualizar Cartões Financeiros
        if (document.getElementById('val-fin-prev-acum') && dados.indicadores) {
            document.getElementById('val-fin-prev-acum').innerText = dados.indicadores.financeiro.previsto_acumulado;
            document.getElementById('val-fin-real-acum').innerText = dados.indicadores.financeiro.realizado_acumulado;
            document.getElementById('val-fin-prev-mensal').innerText = dados.indicadores.financeiro.previsto_mensal;
            document.getElementById('val-fin-real-mensal').innerText = dados.indicadores.financeiro.realizado_mensal;
        }

        // Atualizar Texto de Avaliação
        if (document.getElementById('texto-avaliacao') && dados.avaliacao) {
            document.getElementById('texto-avaliacao').innerText = dados.avaliacao;
        }

        // Carregar Imagens do Carrossel vindas do JSON (Caso existam)
        if (dados.imagens && dados.imagens.length > 0) {
            listaImagens = dados.imagens;
            inicializarCarrossel(listaImagens); 
        }

    } catch (erro) {
        console.warn("Modo local ou dados.json não encontrado. Mantendo dados estáticos.", erro);
    }
}

// Monta o HTML interno do Carrossel baseado na lista informada
function inicializarCarrossel(imagens) {
    const containerSlides = document.getElementById('carousel-slides');
    const containerIndicadores = document.getElementById('carousel-indicators');

    if (!containerSlides || !containerIndicadores) return;

    containerSlides.innerHTML = '';
    containerIndicadores.innerHTML = '';
    totalSlides = imagens.length;
    slideAtual = 0;

    imagens.forEach((img, index) => {
        // Cria o elemento de Slide
        const slide = document.createElement('div');
        slide.className = `absolute inset-0 transition-opacity duration-700 ease-in-out ${index === 0 ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`;
        slide.id = `carousel-slide-${index}`;
        slide.innerHTML = `
            <img src="${img.url}" class="w-full h-full object-cover" alt="${img.legenda || 'Imagem da Obra'}">
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-12 text-white">
                <p class="text-xs uppercase font-semibold text-brand-100 tracking-wider mb-1">Registro Visual</p>
                <p class="text-sm sm:text-base font-medium drop-shadow">${img.legenda || ''}</p>
            </div>
        `;
        containerSlides.appendChild(slide);

        // Cria a bolinha indicadora
        const bolinha = document.createElement('button');
        bolinha.className = `w-2.5 h-2.5 rounded-full transition-all ${index === 0 ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`;
        bolinha.id = `carousel-indicator-${index}`;
        bolinha.setAttribute('onclick', `irParaSlide(${index})`);
        containerIndicadores.appendChild(bolinha);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function atualizarCarrossel() {
    for (let i = 0; i < totalSlides; i++) {
        const slide = document.getElementById(`carousel-slide-${i}`);
        const indicador = document.getElementById(`carousel-indicator-${i}`);

        if (i === slideAtual) {
            if(slide) {
                slide.classList.remove('opacity-0', '-z-10');
                slide.classList.add('opacity-100', 'z-0');
            }
            if(indicador) {
                indicador.classList.remove('bg-white/50', 'scale-100');
                indicador.classList.add('bg-white', 'scale-125');
            }
        } else {
            if(slide) {
                slide.classList.remove('opacity-100', 'z-0');
                slide.classList.add('opacity-0', '-z-10');
            }
            if(indicador) {
                indicador.classList.remove('bg-white', 'scale-125');
                indicador.classList.add('bg-white/50', 'scale-100');
            }
        }
    }
}

function proximoSlide() {
    slideAtual = (slideAtual + 1) % totalSlides;
    atualizarCarrossel();
}

function slideAnterior() {
    slideAtual = (slideAtual - 1 + totalSlides) % totalSlides;
    atualizarCarrossel();
}

function irParaSlide(index) {
    slideAtual = index;
    atualizarCarrossel();
}

// Função auxiliar para converter links normais do YouTube para formato EMBED
function formatarUrlYoutube(url) {
    if (!url) return '';
    if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split(/[?#]/)[0];
        return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('v=')) {
        const id = url.split('v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
    }
    return url;
}

// Funções do Modal do Mapa
function abrirModalMapa() {
    const modal = document.getElementById('modal-mapa');
    const iframeOriginal = document.getElementById('mapa-iframe');
    const iframeModal = document.getElementById('mapa-modal-iframe');
    
    if (modal && iframeOriginal && iframeModal) {
        if (!iframeModal.src) {
            iframeModal.src = iframeOriginal.src;
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
        }, 10);
        
        document.body.style.overflow = 'hidden';
    }
}

function fecharModalMapa() {
    const modal = document.getElementById('modal-mapa');
    
    if (modal) {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        
        setTimeout(() => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
}

// Função unificada para ativar/desativar a Tela Cheia
function alternarTelaCheia(idElemento) {
    const iframe = document.getElementById(idElemento);
    if(!iframe) return;

    if (!document.fullscreenElement) {
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) { /* Safari */
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) { /* IE11 */
            iframe.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

// Funções para controle de interação do Tour 360º
function ativarBanib() {
    const overlay = document.getElementById('banib-overlay');
    const iframe = document.getElementById('banib-iframe');
    if(!overlay || !iframe) return;

    overlay.classList.add('opacity-0');
    setTimeout(() => {
        overlay.classList.add('hidden');
        iframe.classList.remove('pointer-events-none');
    }, 300);
}

function desativarBanib() {
    const overlay = document.getElementById('banib-overlay');
    const iframe = document.getElementById('banib-iframe');
    if(!overlay || !iframe) return;

    if (overlay.classList.contains('hidden')) {
        iframe.classList.add('pointer-events-none');
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
        }, 10);
    }
}

function alternarTelaCheiaBanib(event) {
    if (event) event.stopPropagation();
    const container = document.getElementById('banib-container');
    if(!container) return;

    if (!document.fullscreenElement) {
        ativarBanib();
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function atualizarIconesBanib() {
    const isFullscreen = !!document.fullscreenElement;
    const iconeMax = document.getElementById('icone-banib-max');
    const iconeMin = document.getElementById('icone-banib-min');

    if (iconeMax && iconeMin) {
        if (isFullscreen) {
            iconeMax.classList.remove('block');
            iconeMax.classList.add('hidden');
            iconeMin.classList.remove('hidden');
            iconeMin.classList.add('block');
        } else {
            iconeMin.classList.remove('block');
            iconeMin.classList.add('hidden');
            iconeMax.classList.remove('hidden');
            iconeMax.classList.add('block');
        }
    }
}

document.addEventListener('fullscreenchange', atualizarIconesBanib);
document.addEventListener('webkitfullscreenchange', atualizarIconesBanib);
document.addEventListener('msfullscreenchange', atualizarIconesBanib);

// Quando a página terminar de carregar, executa a função de buscar dados
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    inicializarDocumentos();
});
