async function renderHospedagens() {
  return `
    <div class="hospedagem-header">
      <button
        class="btn btn-primary"
        onclick="abrirNovaHospedagem()">
        + Nova Hospedagem
      </button>
    </div>

    <div class="table-section">
      <div class="table-header">
        <h2>Todas as Hospedagens</h2>
      </div>

      <div
        id="hospedagensTabela"
        class="loading">
        Carregando...
      </div>
    </div>
  `;
}

async function loadHospedagens() {
  const res = await API.get('/hospedagens');
  const lista = res.dados || [];

  const tabela = document.getElementById('hospedagensTabela');

  if (!tabela) return;

  if (!lista.length) {
    tabela.innerHTML = `
      <div class="empty-state">
        <p>Nenhuma hospedagem registrada</p>
      </div>
    `;
    return;
  }

  tabela.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Quarto</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th>Total</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          ${lista.map(renderHospedagemRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAcoesHospedagem(h) {
  if (h.status !== 'ativa') return '';

  return `
    <button
      class="btn btn-primary btn-sm"
      onclick="fazerCheckout(${h.id})">
      Check-out
    </button>

    <button
      class="btn btn-danger btn-sm"
      onclick="cancelarHospedagem(${h.id})">
      Cancelar
    </button>
  `;
}

function renderHospedagemRow(h) {
  return `
    <tr>
      <td class="td-muted">${h.id}</td>

      <td>${h.nome_cliente}</td>

      <td>
        ${h.numero_quarto}
        <span class="td-muted">
          (${h.nome_acomodacao})
        </span>
      </td>

      <td>${formatDate(h.data_checkin)}</td>

      <td>${formatDate(h.data_checkout)}</td>

      <td>${statusBadge(h.status)}</td>

      <td>
        ${h.valor_total
          ? formatMoney(h.valor_total)
          : '—'}
      </td>

      <td>
        <div class="btn-actions">
          ${renderAcoesHospedagem(h)}
        </div>
      </td>
    </tr>
  `;
}

async function abrirNovaHospedagem() {
  const [resClientes, resQuartos] = await Promise.all([
    API.get('/clientes'),
    API.get('/hospedagens/quartos?disponivel=true')
  ]);

  const clientes = (resClientes.dados || [])
    .filter(c => c.tipo === 'titular');

  const quartos = resQuartos.dados || [];

  openModal(
    'Nova Hospedagem',
    renderFormularioHospedagem(clientes, quartos)
  );
}

function renderFormularioHospedagem(clientes, quartos) {
  return `
    <div class="form-grid">

      <div class="form-group full">
        <label>Cliente Titular *</label>

        <select id="hCliente">
          <option value="">
            Selecione o cliente
          </option>

          ${clientes.map(cliente => `
            <option value="${cliente.id}">
              ${cliente.nome}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="form-group full">
        <label>Quarto *</label>

        <select
          id="hQuarto"
          onchange='mostrarDetalhesQuarto(this, ${JSON.stringify(quartos)})'>

          <option value="">
            Selecione o quarto
          </option>

          ${quartos.map(quarto => `
            <option value="${quarto.id}">
              ${quarto.numero}
              —
              ${quarto.nome_acomodacao}
              —
              ${formatMoney(quarto.preco_diaria)}/dia
            </option>
          `).join('')}
        </select>
      </div>

      <div
        id="detalheQuarto"
        class="form-group full detalhe-quarto">

        <div id="detalheQuartoConteudo"></div>

      </div>

      <div class="form-group">
        <label>Data de Check-in *</label>

        <input
          type="date"
          id="hCheckin"
          value="${new Date().toISOString().substring(0, 10)}">
      </div>

      <div class="form-group full">
        <label>Observações</label>

        <textarea
          id="hObs"
          placeholder="Observações opcionais..."></textarea>
      </div>

    </div>

    <div class="form-actions">
      <button
        class="btn btn-outline"
        onclick="closeModal()">
        Cancelar
      </button>

      <button
        class="btn btn-primary"
        onclick="confirmarHospedagem()">
        Confirmar Check-in
      </button>
    </div>
  `;
}

async function abrirNovaHospedagem() {
  const [resClientes, resQuartos] = await Promise.all([
    API.get('/clientes'),
    API.get('/hospedagens/quartos?disponivel=true'),
  ]);

  const clientes = (resClientes.dados || []).filter(c => c.tipo === 'titular');
  const quartos  = resQuartos.dados || [];

  openModal('Nova Hospedagem', `
    <div class="form-grid">
      <div class="form-group full">
        <label>Cliente Titular *</label>
        <select id="hCliente">
          <option value="">Selecione o cliente</option>
          ${clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
        </select>
      </div>
      <div class="form-group full">
        <label>Quarto *</label>
        <select id="hQuarto" onchange="mostrarDetalhesQuarto(this, ${JSON.stringify(quartos)})">
          <option value="">Selecione o quarto</option>
          ${quartos.map(q => `<option value="${q.id}">${q.numero} — ${q.nome_acomodacao} — ${formatMoney(q.preco_diaria)}/dia</option>`).join('')}
        </select>
      </div>
      <div id="detalheQuarto" class="form-group full" style="display:none">
        <div id="detalheQuartoConteudo"></div>
      </div>
      <div class="form-group">
        <label>Data de Check-in *</label>
        <input type="date" id="hCheckin" value="${new Date().toISOString().substring(0,10)}" />
      </div>
      <div class="form-group full">
        <label>Observações</label>
        <textarea id="hObs" placeholder="Observações opcionais..."></textarea>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="confirmarHospedagem()">Confirmar Check-in</button>
    </div>
  `);
}

function mostrarDetalhesQuarto(select, quartos) {
  const quarto = quartos.find(
    q => q.id == select.value
  );

  const container =
    document.getElementById('detalheQuarto');

  const conteudo =
    document.getElementById('detalheQuartoConteudo');

  if (!quarto) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  conteudo.innerHTML = `
    <div class="detalhe-quarto-card">

      <div class="detalhe-quarto-titulo">
        Detalhes — ${quarto.nome_acomodacao}
      </div>

      <div class="detalhe-quarto-info">

        <span>
          🛏 Solteiro:
          <strong>${quarto.camas_solteiro}</strong>
        </span>

        <span>
          🛌 Casal:
          <strong>${quarto.camas_casal}</strong>
        </span>

        <span>
          🛁 Suítes:
          <strong>${quarto.suites}</strong>
        </span>

        <span>
          ❄️ Climatização:
          <strong>
            ${quarto.climatizacao ? 'Sim' : 'Não'}
          </strong>
        </span>

        <span>
          🚗 Garagem:
          <strong>${quarto.garagem}</strong>
        </span>

        <span class="detalhe-quarto-preco">
          💰 ${formatMoney(quarto.preco_diaria)}/dia
        </span>

      </div>

    </div>
  `;
}

async function confirmarHospedagem() {
  const body = {
    cliente_id: document.getElementById('hCliente').value,
    quarto_id:  document.getElementById('hQuarto').value,
    data_checkin: document.getElementById('hCheckin').value,
    observacoes: document.getElementById('hObs').value || undefined,
  };

  if (!body.cliente_id || !body.quarto_id || !body.data_checkin) {
    showToast('Preencha todos os campos obrigatórios', 'error'); return;
  }

  const res = await API.post('/hospedagens', body);
  if (res.sucesso) {
    showToast('Check-in realizado com sucesso!');
    closeModal();
    loadHospedagens();
  } else {
    showToast(res.mensagem || 'Erro ao criar hospedagem', 'error');
  }
}

async function fazerCheckout(id) {
  const hoje = new Date().toISOString().substring(0,10);
  openModal('Realizar Check-out', `
    <div class="form-group">
      <label>Data de Check-out *</label>
      <input type="date" id="dataCheckout" value="${hoje}" />
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="confirmarCheckout(${id})">Confirmar Check-out</button>
    </div>
  `);
}

async function confirmarCheckout(id) {
  const data_checkout = document.getElementById('dataCheckout').value;
  if (!data_checkout) { showToast('Informe a data de check-out', 'error'); return; }
  const res = await API.patch(`/hospedagens/${id}/checkout`, { data_checkout });
  if (res.sucesso) {
    showToast('Check-out realizado!');
    closeModal();
    loadHospedagens();
  } else {
    showToast(res.mensagem || 'Erro', 'error');
  }
}

async function cancelarHospedagem(id) {
  if (!confirm('Deseja cancelar esta hospedagem?')) return;
  const res = await API.patch(`/hospedagens/${id}/cancelar`, {});
  if (res.sucesso) { showToast('Hospedagem cancelada'); loadHospedagens(); }
  else showToast(res.mensagem || 'Erro', 'error');
}
