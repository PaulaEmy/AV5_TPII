async function renderQuartos() {
  return `
    <div
      id="quartosConteudo"
      class="loading">
      Carregando...
    </div>
  `;
}

async function loadQuartos() {

  const [
    resQuartos,
    resAcomodacoes
  ] = await Promise.all([
    API.get('/hospedagens/quartos'),
    API.get('/hospedagens/acomodacoes')
  ]);

  const quartos =
    resQuartos.dados || [];

  const acomodacoes =
    resAcomodacoes.dados || [];

  const container =
    document.getElementById('quartosConteudo');

  if (!container) return;

  container.innerHTML = `

    ${renderTabelaAcomodacoes(
      acomodacoes
    )}

    ${renderTabelaQuartos(
      quartos
    )}
  `;
}

function renderResumoQuartos(quartos) {

  const disponiveis =
    quartos.filter(
      quarto => quarto.disponivel
    ).length;

  const ocupados =
    quartos.filter(
      quarto => !quarto.disponivel
    ).length;
}

function renderTabelaAcomodacoes(
  acomodacoes
) {
  return `
    <div
      class="table-section quartos-section">

      <div class="table-header">
        <h2>
          Tipos de Acomodação
        </h2>
      </div>

      <div class="table-wrap">

        <table>

          <thead>
            <tr>
              <th>Nome</th>
              <th>Cama Solteiro</th>
              <th>Cama Casal</th>
              <th>Suíte</th>
              <th>Climatização</th>
              <th>Garagem</th>
              <th>Diária</th>
            </tr>
          </thead>

          <tbody>

            ${acomodacoes
              .map(renderAcomodacaoRow)
              .join('')}

          </tbody>

        </table>

      </div>

    </div>
  `;
}

function renderAcomodacaoRow(
  acomodacao
) {
  return `
    <tr>

      <td>
        <strong>
          ${acomodacao.nome}
        </strong>
      </td>

      <td>
        ${acomodacao.camas_solteiro}
      </td>

      <td>
        ${acomodacao.camas_casal}
      </td>

      <td>
        ${acomodacao.suites}
      </td>

      <td>
        ${
          acomodacao.climatizacao
            ? '<span class="badge badge-green">Sim</span>'
            : '<span class="badge badge-gray">Não</span>'
        }
      </td>

      <td>
        ${acomodacao.garagem}
      </td>

      <td class="valor-diaria">
        ${formatMoney(
          acomodacao.preco_diaria
        )}
      </td>

    </tr>
  `;
}

function renderTabelaQuartos(
  quartos
) {
  return `
    <div class="table-section">

      <div class="table-header">
        <h2>Quartos</h2>
      </div>

      <div class="table-wrap">

        <table>

          <thead>
            <tr>
              <th>Nº Quarto</th>
              <th>Acomodação</th>
              <th>Camas Solteiro</th>
              <th>Camas Casal</th>
              <th>Suítes</th>
              <th>Garagem</th>
              <th>Diária</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            ${quartos
              .map(renderQuartoRow)
              .join('')}

          </tbody>

        </table>

      </div>

    </div>
  `;
}

function renderQuartoRow(
  quarto
) {
  return `
    <tr>

      <td>
        <strong>
          ${quarto.numero}
        </strong>
      </td>

      <td>
        ${quarto.nome_acomodacao}
      </td>

      <td>
        ${quarto.camas_solteiro}
      </td>

      <td>
        ${quarto.camas_casal}
      </td>

      <td>
        ${quarto.suites}
      </td>

      <td>
        ${quarto.garagem}
      </td>

      <td class="valor-diaria">
        ${formatMoney(
          quarto.preco_diaria
        )}
      </td>

      <td>
        ${
          quarto.disponivel
            ? '<span class="badge badge-green">Disponível</span>'
            : '<span class="badge badge-red">Ocupado</span>'
        }
      </td>

    </tr>
  `;
}