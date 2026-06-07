let clienteSearch = '';

async function renderClientes() {
  return `
    <div class="search-bar">
      <input type="text" id="searchCliente" placeholder="Buscar cliente pelo nome..." oninput="filtrarClientes()" />
      <button class="btn btn-primary" onclick="abrirFormCliente()">+ Novo Cliente</button>
    </div>
    <div class="table-section">
      <div class="table-header">
        <h2>Clientes Cadastrados</h2>
      </div>
      <div id="clientesTabela" class="loading">Carregando...</div>
    </div>
  `;
}

let todosClientes = [];

async function loadClientes() {
  const res = await API.get('/clientes');
  todosClientes = res.dados || [];
  renderTabelaClientes(todosClientes);
}

function filtrarClientes() {
  const termo = document.getElementById('searchCliente')?.value.toLowerCase() || '';
  const filtrados = todosClientes.filter(c => c.nome.toLowerCase().includes(termo));
  renderTabelaClientes(filtrados);
}

function renderTabelaClientes(lista) {
  const el = document.getElementById('clientesTabela');
  if (!el) return;

  if (!lista.length) {
    el.innerHTML = `<div class="empty-state"><p>Nenhum cliente encontrado</p></div>`;
    return;
  }

  el.innerHTML = `<div class="table-wrap"><table>
    <thead><tr>
      <th>#</th><th>Nome</th><th>Tipo</th><th>E-mail</th><th>Nascimento</th><th>Ações</th>
    </tr></thead>
    <tbody>
      ${lista.map(c => `
        <tr>
          <td class="td-muted">${c.id}</td>
          <td><strong>${c.nome}</strong>${c.nome_titular ? `<br><span class="td-muted">Dep. de: ${c.nome_titular}</span>` : ''}</td>
          <td>${statusBadge(c.tipo)}</td>
          <td class="td-muted">${c.email || '—'}</td>
          <td class="td-muted">${formatDate(c.data_nascimento)}</td>
          <td>
            <div class="btn-actions">
              <button class="btn btn-outline btn-sm" onclick="verCliente(${c.id})">Detalhes</button>
              <button class="btn btn-outline btn-sm" onclick="editarCliente(${c.id})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deletarCliente(${c.id})">Excluir</button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

function abrirFormCliente(dados = null) {
  const titulares = todosClientes.filter(c => c.tipo === 'titular');
  const titulo = dados ? 'Editar Cliente' : 'Novo Cliente';

  openModal(titulo, `
    <div class="form-grid">
      <div class="form-group full">
        <label>Nome Completo *</label>
        <input type="text" id="fNome" value="${dados?.nome || ''}" placeholder="Nome do cliente" />
      </div>
      <div class="form-group">
        <label>E-mail</label>
        <input type="email" id="fEmail" value="${dados?.email || ''}" placeholder="email@exemplo.com" />
      </div>
      <div class="form-group">
        <label>Data de Nascimento</label>
        <input type="date" id="fNascimento" value="${dados?.data_nascimento?.substring(0,10) || ''}" />
      </div>
      <div class="form-group">
        <label>Tipo *</label>
        <select id="fTipo" onchange="toggleTitular()">
          <option value="titular" ${!dados || dados.tipo === 'titular' ? 'selected' : ''}>Titular</option>
          <option value="dependente" ${dados?.tipo === 'dependente' ? 'selected' : ''}>Dependente</option>
        </select>
      </div>
      <div class="form-group" id="grupoTitular" style="${dados?.tipo === 'dependente' ? '' : 'display:none'}">
        <label>Titular</label>
        <select id="fTitularId">
          <option value="">Selecione o titular</option>
          ${titulares.map(t => `<option value="${t.id}" ${dados?.titular_id === t.id ? 'selected' : ''}>${t.nome}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarCliente(${dados?.id || 'null'})">
        ${dados ? 'Salvar Alterações' : 'Cadastrar Cliente'}
      </button>
    </div>
  `);
}

function toggleTitular() {
  const tipo = document.getElementById('fTipo').value;
  document.getElementById('grupoTitular').style.display = tipo === 'dependente' ? '' : 'none';
}

async function salvarCliente(id) {
  const body = {
    nome: document.getElementById('fNome').value.trim(),
    email: document.getElementById('fEmail').value.trim() || undefined,
    tipo: document.getElementById('fTipo').value,
    titular_id: document.getElementById('fTitularId')?.value || undefined,
    data_nascimento: document.getElementById('fNascimento').value || undefined,
  };

  if (!body.nome) { showToast('Nome é obrigatório', 'error'); return; }

  const res = id
    ? await API.put(`/clientes/${id}`, body)
    : await API.post('/clientes', body);

  if (res.sucesso) {
    showToast(id ? 'Cliente atualizado!' : 'Cliente cadastrado!');
    closeModal();
    loadClientes();
  } else {
    showToast(res.mensagem || 'Erro ao salvar', 'error');
  }
}

async function editarCliente(id) {
  const res = await API.get(`/clientes/${id}`);
  if (res.sucesso) abrirFormCliente(res.dados);
}

async function deletarCliente(id) {
  if (!confirm('Deseja excluir este cliente? Esta ação é irreversível.')) return;
  const res = await API.delete(`/clientes/${id}`);
  if (res.sucesso) { showToast('Cliente excluído'); loadClientes(); }
  else showToast(res.mensagem || 'Erro ao excluir', 'error');
}

async function verCliente(id) {
  const res = await API.get(`/clientes/${id}`);
  if (!res.sucesso) { showToast('Erro ao carregar cliente', 'error'); return; }
  const c = res.dados;

  openModal(`Detalhes — ${c.nome}`, `
    <div class="detail-section">
      <h3>Documentos</h3>
      <div class="tags-list" id="listaDocs">
        ${c.documentos.map(d => `
          <span class="tag">
            <strong>${d.tipo}</strong> ${d.numero}
            <button onclick="removerDoc(${c.id}, ${d.id})" title="Remover">✕</button>
          </span>`).join('') || '<span class="td-muted">Nenhum documento</span>'}
      </div>
      <div class="add-inline" style="margin-top:12px">
        <select id="novoDocTipo">
          <option>CPF</option>
          <option>RG</option>
          <option>Passaporte</option>
        </select>
        <input type="text" id="novoDocNum" placeholder="Número" />
        <button class="btn btn-primary btn-sm" onclick="adicionarDoc(${c.id})">+ Adicionar</button>
      </div>
    </div>
    <div class="detail-section">
      <h3>Telefones</h3>
      <div class="tags-list" id="listaTels">
        ${c.telefones.map(t => `
          <span class="tag">
            ${t.numero} <span class="td-muted">(${t.tipo})</span>
            <button onclick="removerTel(${c.id}, ${t.id})" title="Remover">✕</button>
          </span>`).join('') || '<span class="td-muted">Nenhum telefone</span>'}
      </div>
      <div class="add-inline" style="margin-top:12px">
        <input type="text" id="novoTelNum" placeholder="(00) 00000-0000" />
        <select id="novoTelTipo">
          <option value="celular">Celular</option>
          <option value="residencial">Residencial</option>
          <option value="comercial">Comercial</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="adicionarTel(${c.id})">+ Adicionar</button>
      </div>
    </div>
  `);
}

async function adicionarDoc(clienteId) {
  const tipo = document.getElementById('novoDocTipo').value;
  const numero = document.getElementById('novoDocNum').value.trim();
  if (!numero) { showToast('Informe o número do documento', 'error'); return; }
  const res = await API.post(`/clientes/${clienteId}/documentos`, { tipo, numero });
  if (res.sucesso) { showToast('Documento adicionado'); verCliente(clienteId); }
  else showToast(res.mensagem, 'error');
}

async function removerDoc(clienteId, docId) {
  const res = await API.delete(`/clientes/${clienteId}/documentos/${docId}`);
  if (res.sucesso) { showToast('Documento removido'); verCliente(clienteId); }
  else showToast(res.mensagem, 'error');
}

async function adicionarTel(clienteId) {
  const numero = document.getElementById('novoTelNum').value.trim();
  const tipo = document.getElementById('novoTelTipo').value;
  if (!numero) { showToast('Informe o número de telefone', 'error'); return; }
  const res = await API.post(`/clientes/${clienteId}/telefones`, { numero, tipo });
  if (res.sucesso) { showToast('Telefone adicionado'); verCliente(clienteId); }
  else showToast(res.mensagem, 'error');
}

async function removerTel(clienteId, telId) {
  const res = await API.delete(`/clientes/${clienteId}/telefones/${telId}`);
  if (res.sucesso) { showToast('Telefone removido'); verCliente(clienteId); }
  else showToast(res.mensagem, 'error');
}
