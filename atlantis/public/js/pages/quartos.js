async function renderQuartos() {
  return `
    <div id="quartosConteudo" class="loading">Carregando...</div>
  `;
}

async function loadQuartos() {
  const [resQuartos, resAcom] = await Promise.all([
    API.get('/hospedagens/quartos'),
    API.get('/hospedagens/acomodacoes'),
  ]);

  const quartos     = resQuartos.dados  || [];
  const acomodacoes = resAcom.dados     || [];
  const el = document.getElementById('quartosConteudo');
  if (!el) return;

  const disponiveis = quartos.filter(q => q.disponivel).length;
  const ocupados    = quartos.filter(q => !q.disponivel).length;

  el.innerHTML = `
    <div style="display:flex;gap:16px;margin-bottom:28px;flex-wrap:wrap">
      <div class="stat-card" style="flex:1;min-width:140px">
        <div class="stat-label">Total de Quartos</div>
        <div class="stat-value">${quartos.length}</div>
      </div>
      <div class="stat-card" style="flex:1;min-width:140px;border-top-color:#2D6A4F">
        <div class="stat-label">Disponíveis</div>
        <div class="stat-value">${disponiveis}</div>
      </div>
      <div class="stat-card" style="flex:1;min-width:140px;border-top-color:#C0392B">
        <div class="stat-label">Ocupados</div>
        <div class="stat-value">${ocupados}</div>
      </div>
    </div>

    <!-- Tabela de acomodações (Tabela 1) -->
    <div class="table-section" style="margin-bottom:28px">
      <div class="table-header">
        <h2>Tipos de Acomodação</h2>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Nome</th>
            <th>Cama Solteiro</th>
            <th>Cama Casal</th>
            <th>Suíte</th>
            <th>Climatização</th>
            <th>Garagem</th>
            <th>Diária</th>
          </tr></thead>
          <tbody>
            ${acomodacoes.map(a => `
              <tr>
                <td><strong>${a.nome}</strong></td>
                <td>${a.camas_solteiro}</td>
                <td>${a.camas_casal}</td>
                <td>${a.suites}</td>
                <td>${a.climatizacao ? '<span class="badge badge-green">Sim</span>' : '<span class="badge badge-gray">Não</span>'}</td>
                <td>${a.garagem}</td>
                <td style="color:var(--gold-dark);font-weight:500">${formatMoney(a.preco_diaria)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Grid de quartos -->
    <div class="table-section">
      <div class="table-header"><h2>Quartos</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Nº Quarto</th>
            <th>Acomodação</th>
            <th>Camas Solteiro</th>
            <th>Camas Casal</th>
            <th>Suítes</th>
            <th>Garagem</th>
            <th>Diária</th>
            <th>Status</th>
          </tr></thead>
          <tbody>
            ${quartos.map(q => `
              <tr>
                <td><strong>${q.numero}</strong></td>
                <td>${q.nome_acomodacao}</td>
                <td>${q.camas_solteiro}</td>
                <td>${q.camas_casal}</td>
                <td>${q.suites}</td>
                <td>${q.garagem}</td>
                <td style="color:var(--gold-dark);font-weight:500">${formatMoney(q.preco_diaria)}</td>
                <td>${q.disponivel
                  ? '<span class="badge badge-green">Disponível</span>'
                  : '<span class="badge badge-red">Ocupado</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
