async function renderDashboard() {
  const res = await API.get('/hospedagens/dashboard');
  const dados = res.dados;

  return `
    ${renderDashboardStats(dados)}

    <div class="table-section">

      <div class="table-header">
        <h2>Hospedagens Recentes</h2>

        <a
          href="#"
          class="btn btn-outline btn-sm dashboard-link"
          onclick="navigate('hospedagens')">
          Ver todas
        </a>
      </div>

      <div
        id="dashHospedagens"
        class="loading dashboard-loading">
        Carregando...
      </div>

    </div>
  `;
}

function renderDashboardStats(dados) {
  return `
    <div class="stats-grid">

      ${renderStatCard(
        'Clientes Titulares',
        dados.totalClientes
      )}

      ${renderStatCard(
        'Hospedagens Ativas',
        dados.hospedagensAtivas
      )}

      ${renderStatCard(
        'Quartos Ocupados',
        dados.quartosOcupados
      )}

      ${renderStatCard(
        'Quartos Disponíveis',
        dados.quartosDisponiveis
      )}

      ${renderStatCard(
        'Receita Total',
        formatMoney(dados.receitaTotal),
        'stat-value-money'
      )}

    </div>
  `;
}

function renderStatCard(
  titulo,
  valor,
  extraClass = ''
) {
  return `
    <div class="stat-card">

      <div class="stat-label">
        ${titulo}
      </div>

      <div class="stat-value ${extraClass}">
        ${valor}
      </div>

    </div>
  `;
}

async function loadDashboardHospedagens() {

  const res = await API.get('/hospedagens');

  const hospedagens = (res.dados || [])
    .filter(h => h.status === 'ativa')
    .slice(0, 6);

  const container =
    document.getElementById('dashHospedagens');

  if (!container) return;

  if (!hospedagens.length) {

    container.innerHTML = `
      <div class="empty-state">
        <p>Nenhuma hospedagem ativa</p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="table-wrap">

      <table>

        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Quarto</th>
            <th>Check-in</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          ${hospedagens
            .map(renderDashboardRow)
            .join('')}
        </tbody>

      </table>

    </div>
  `;
}

function renderDashboardRow(hospedagem) {
  return `
    <tr>

      <td class="td-muted">
        ${hospedagem.id}
      </td>

      <td>
        ${hospedagem.nome_cliente}
      </td>

      <td>
        ${hospedagem.numero_quarto}
        <span class="td-muted">
          (${hospedagem.nome_acomodacao})
        </span>
      </td>

      <td>
        ${formatDate(hospedagem.data_checkin)}
      </td>

      <td>
        ${statusBadge(hospedagem.status)}
      </td>

    </tr>
  `;
}