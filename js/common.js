// Inicializa os ícones do Lucide
function inicializarIcones() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function carregarComponentesComuns(tituloBase) {
    inicializarIcones();

    // Carrega o footer
    fetch('footer.html')
        .then(resposta => resposta.text())
        .then(dados => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = dados;
                inicializarIcones();
            }
        })
        .catch(erro => console.error("Erro ao carregar footer:", erro));

    // Carrega o navbar e, em seguida, os dados.json para o título
    fetch('navbar.html')
        .then(resposta => resposta.text())
        .then(html => {
            const navbarPlaceholder = document.getElementById('navbar-placeholder');
            if (navbarPlaceholder) {
                navbarPlaceholder.innerHTML = html;
                inicializarIcones();
            }
            return fetch('dados.json');
        })
        .then(resposta => resposta.json())
        .then(dados => {
            const textoIndex = `${tituloBase} - Referência ${dados.mes_referencia}`;
            const navDesktop = document.getElementById('nav-subtitle-desktop');
            const navMobile = document.getElementById('nav-subtitle-mobile');
            
            if (navDesktop) navDesktop.innerText = textoIndex;
            if (navMobile) navMobile.innerText = textoIndex;

            // Se houver uma função carregarDadosGlobal definida na página, chama ela
            if (typeof window.carregarDadosGlobais === 'function') {
                window.carregarDadosGlobais(dados);
            }
        })
        .catch(erro => console.error("Erro ao carregar navbar ou JSON:", erro));
}

// Inicializa automaticamente se a página não for usar uma chamada manual
document.addEventListener('DOMContentLoaded', () => {
    // Essa chamada será sobrescrita no index.html e outras páginas se desejado,
    // ou podemos apenas deixar as páginas chamarem carregarComponentesComuns('Titulo').
});
