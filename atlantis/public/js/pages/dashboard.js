async function renderDashboard() {
  const res = await API.get('/hospedagens/dashboard');
  const s = res.dados;

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Clientes Titulares</div>
        <div class="stat-value">${s.totalClientes}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Hospedagens Ativas</div>
        <div class="stat-value">${s.hospedagensAtivas}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Quartos Ocupados</div>
        <div class="stat-value">${s.quartosOcupados}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Quartos Disponíveis</div>
        <div class="stat-value">${s.quartosDisponiveis}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Receita Total</div>
        <div class="stat-value" style="font-size:24px">${formatMoney(s.receitaTotal)}</div>
      </div>
    </div>

    <div class="table-section">
      <div class="table-header">
        <h2>Hospedagens Recentes</h2>
        <a href="#" class="btn btn-outline btn-sm" onclick="navigate('hospedagens')">Ver todas</a>
      </div>
      <div id="dashHospedagens" class="loading">Carregando...</div>
    </div>
  `;
}

async function loadDashboardHospedagens() {
  const res = await API.get('/hospedagens');
  const lista = (res.dados || []).filter(h => h.status === 'ativa').slice(0, 6);
  const el = document.getElementById('dashHospedagens');
  if (!el) return;

  if (!lista.length) {
    el.innerHTML = `<div class="empty-state"><p>Nenhuma hospedagem ativa</p></div>`;
    return;
  }

  el.innerHTML = `<div class="table-wrap"><table>
    <thead><tr>
      <th>#</th><th>Cliente</th><th>Quarto</th><th>Check-in</th><th>Status</th>
    </tr></thead>
    <tbody>
      ${lista.map(h => `
        <tr>
          <td class="td-muted">${h.id}</td>
          <td>${h.nome_cliente}</td>
          <td>${h.numero_quarto} <span class="td-muted">(${h.nome_acomodacao})</span></td>
          <td>${formatDate(h.data_checkin)}</td>
          <td>${statusBadge(h.status)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}
