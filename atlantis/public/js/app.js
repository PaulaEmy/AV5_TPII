const pages = {
  dashboard:   { title: 'Dashboard', render: renderDashboard, load: loadDashboardHospedagens },
  clientes:    { title: 'Clientes', render: renderClientes, load: loadClientes },
  hospedagens: { title: 'Hospedagens', render: renderHospedagens, load: loadHospedagens },
  quartos:     { title: 'Quartos', render: renderQuartos, load: loadQuartos },
};

let currentPage = 'dashboard';

async function navigate(page) {
  currentPage = page;
  const p = pages[page];
  if (!p) return;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  document.getElementById('pageTitle').textContent = p.title;

  const content = document.getElementById('pageContent');
  content.innerHTML = '<div class="loading">Carregando...</div>';
  content.innerHTML = await p.render();

  if (p.load) await p.load();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('currentDate').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.page);
    });
  });

  navigate('dashboard');
});

window.navigate = navigate;
