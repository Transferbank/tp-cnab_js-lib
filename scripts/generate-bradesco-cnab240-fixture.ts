#!/usr/bin/env ts-node
/**
 * Gera do zero a fixture CNAB 240 do Bradesco (tests/fixtures/cnab240/bradesco/remessa-multipla.txt
 * + .json), a partir de fontes INDEPENDENTES do schema TypeScript deste projeto:
 *
 * - pycnab240 (JSON declarativo, lib de terceiros): header_arquivo, header_lote_cobranca, segmento_p,
 *   segmento_q, segmento_r, trailer_lote_cobranca, trailer_arquivo
 * - Segmento S: transcrito de src/banks/bradesco/schemas/cnab240/segment-s.md, que por sua vez cita
 *   diretamente o manual oficial Bradesco ("Padrão FEBRABAN 240 Posições V6.0", pág. 16/46)
 * - Decomposição do bloco 38-57 do Segmento P (carteira/zeros/nosso-número/dv) e da observação sobre
 *   a zona 33-52 do Header ("código do cliente" = carteira+agência+conta+dv) confirmadas contra o
 *   PDF oficial 2013 v02, byte a byte
 *
 * Propositalmente NÃO importa nada de src/banks/bradesco/schemas/cnab240/*.ts — o objetivo é ter uma
 * fixture construída de forma independente do schema, para servir de verificação cruzada (ver
 * tests/schemas/banks/bradesco/cnab240/integration.test.ts, que faz o parsing desta fixture usando o
 * schema real e compara contra o metadata.json gerado aqui).
 *
 * Uso: npx ts-node scripts/generate-bradesco-cnab240-fixture.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const FIXTURE_DIR = path.join(__dirname, '..', 'tests', 'fixtures', 'cnab240', 'bradesco')
const TXT_PATH = path.join(FIXTURE_DIR, 'remessa-multipla.txt')
const JSON_PATH = path.join(FIXTURE_DIR, 'remessa-multipla.json')

const PYCNAB_DIR = path.join(
  __dirname,
  '..',
  'src',
  'docs',
  'python-cnab-master3',
  'cnab240',
  'bancos',
  'bradesco',
  'specs',
)

// ---------- specs independentes (pycnab240) ----------

type Campo = {
  nome: string
  posicao_inicio: number
  posicao_fim: number
  formato: 'num' | 'alfa'
  decimais?: number
  default?: string | number
}
type Spec = { nome: string; campos: Record<string, Campo> }

function loadSpec(filename: string): Spec {
  return JSON.parse(fs.readFileSync(path.join(PYCNAB_DIR, filename), 'utf-8'))
}

const HEADER_ARQUIVO = loadSpec('header_arquivo.json')
const HEADER_LOTE = loadSpec('header_lote_cobranca.json')
const SEGMENTO_P = loadSpec('segmento_p.json')
const SEGMENTO_Q = loadSpec('segmento_q.json')
const SEGMENTO_R = loadSpec('segmento_r.json')
const TRAILER_LOTE = loadSpec('trailer_lote_cobranca.json')
const TRAILER_ARQUIVO = loadSpec('trailer_arquivo.json')

// Segmento S não existe no pycnab240 (nenhuma lib analisada o implementa para o Bradesco — ver
// segment-s.md). Transcrito diretamente do manual oficial (variante A: mensagem livre, tipo_impressao
// 1 ou 2), mesma convenção de campos 1-17 dos demais segmentos 3xxx.
const SEGMENTO_S: Spec = {
  nome: 'SegmentoS',
  campos: {
    '01.3S': { nome: 'controle_banco', posicao_inicio: 1, posicao_fim: 3, formato: 'num', default: 237 },
    '02.3S': { nome: 'controle_lote', posicao_inicio: 4, posicao_fim: 7, formato: 'num' },
    '03.3S': { nome: 'controle_registro', posicao_inicio: 8, posicao_fim: 8, formato: 'num', default: 3 },
    '04.3S': { nome: 'servico_numero_registro', posicao_inicio: 9, posicao_fim: 13, formato: 'num' },
    '05.3S': { nome: 'servico_segmento', posicao_inicio: 14, posicao_fim: 14, formato: 'alfa', default: 'S' },
    '06.3S': { nome: 'cnab_exclusivo_1', posicao_inicio: 15, posicao_fim: 15, formato: 'alfa', default: '' },
    '07.3S': { nome: 'servico_codigo_movimento', posicao_inicio: 16, posicao_fim: 17, formato: 'num' },
    '08.3S': { nome: 'tipo_impressao', posicao_inicio: 18, posicao_fim: 18, formato: 'num' },
    '09.3S': { nome: 'numero_linha', posicao_inicio: 19, posicao_fim: 20, formato: 'num' },
    '10.3S': { nome: 'mensagem', posicao_inicio: 21, posicao_fim: 160, formato: 'alfa' },
    '11.3S': { nome: 'tipo_fonte', posicao_inicio: 161, posicao_fim: 162, formato: 'num' },
    '12.3S': { nome: 'cnab_exclusivo_2', posicao_inicio: 163, posicao_fim: 240, formato: 'alfa', default: '' },
  },
}

// ---------- helpers de baixo nível ----------

function buildLine(spec: Spec, overrides: Record<string, string | number>): string {
  const chars = new Array(240).fill(' ')

  for (const campo of Object.values(spec.campos)) {
    const width = campo.posicao_fim - campo.posicao_inicio + 1
    const provided = overrides[campo.nome]
    const raw = provided !== undefined ? provided : campo.default !== undefined ? campo.default : campo.formato === 'num' ? 0 : ''

    let str: string
    if (campo.formato === 'num') {
      const scaled = campo.decimais ? Math.round(Number(raw) * Math.pow(10, campo.decimais)) : Number(raw)
      str = String(Math.max(0, scaled)).padStart(width, '0').slice(-width)
    } else {
      str = String(raw).toUpperCase().slice(0, width).padEnd(width, ' ')
    }

    for (let i = 0; i < width; i++) {
      chars[campo.posicao_inicio - 1 + i] = str[i]
    }
  }

  const line = chars.join('')
  if (line.length !== 240) {
    throw new Error(`Linha do registro ${spec.nome} ficou com ${line.length} caracteres (esperado 240)`)
  }
  return line
}

function cpfCheckDigits(base9: string): string {
  const calc = (digits: string, startWeight: number): number => {
    const sum = digits.split('').reduce((acc, d, i) => acc + parseInt(d, 10) * (startWeight - i), 0)
    const mod = (sum * 10) % 11
    return mod === 10 ? 0 : mod
  }
  const d1 = calc(base9, 10)
  const d2 = calc(base9 + d1, 11)
  return `${d1}${d2}`
}

function makeFakeCpf(seed: number): string {
  const base = String(100000000 + seed * 7919).slice(-9)
  return base + cpfCheckDigits(base)
}

function cnpjCheckDigits(base12: string): string {
  const calc = (digits: string, weights: number[]): number => {
    const sum = digits.split('').reduce((acc, d, i) => acc + parseInt(d, 10) * weights[i], 0)
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d1 = calc(base12, w1)
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d2 = calc(base12 + d1, w2)
  return `${d1}${d2}`
}

function makeFakeCnpj(seed: number): string {
  const base = String(600000000000 + seed * 9973).slice(-12)
  return base + cnpjCheckDigits(base)
}

function ddmmaaaa(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}${year}`
}

// ---------- dados fictícios ----------

const cedente = {
  nome: 'EMPRESA EXEMPLO LTDA',
  cnpj: makeFakeCnpj(1),
  agencia: '1234',
  agenciaDv: '5',
  conta: '00123456789',
  contaDv: '6',
  carteira: '1', // 1=Cobrança Simples
}

type Titulo = {
  nomeSacado: string
  tipoInscricao: 1 | 2 // 1=CPF, 2=CNPJ
  documento: string
  endereco: string
  bairro: string
  cep: string
  cidade: string
  uf: string
  numeroDocumento: string
  nossoNumero: string
  amount: number
  vencimento: { d: number; m: number; y: number }
  emissao: { d: number; m: number; y: number }
}

const titulos: Titulo[] = [
  {
    nomeSacado: 'JOAO EXEMPLO SILVA',
    tipoInscricao: 1,
    documento: makeFakeCpf(1),
    endereco: 'RUA EXEMPLO 123',
    bairro: 'CENTRO',
    cep: '01234567',
    cidade: 'SAO PAULO',
    uf: 'SP',
    numeroDocumento: 'NF0000123',
    nossoNumero: '00012345001',
    amount: 100.0,
    vencimento: { d: 15, m: 12, y: 2026 },
    emissao: { d: 1, m: 12, y: 2026 },
  },
  {
    nomeSacado: 'MARIA EXEMPLO SILVA',
    tipoInscricao: 1,
    documento: makeFakeCpf(2),
    endereco: 'AV PAULISTA 1000',
    bairro: 'BELA VISTA',
    cep: '01311000',
    cidade: 'SAO PAULO',
    uf: 'SP',
    numeroDocumento: 'NF0000124',
    nossoNumero: '00012345002',
    amount: 250.0,
    vencimento: { d: 20, m: 12, y: 2026 },
    emissao: { d: 6, m: 12, y: 2026 },
  },
  {
    nomeSacado: 'COMERCIAL EXEMPLO LTDA',
    tipoInscricao: 2,
    documento: makeFakeCnpj(2),
    endereco: 'RUA COMERCIAL EXEMPLO 500',
    bairro: 'VILA INDUSTRIAL',
    cep: '04567890',
    cidade: 'SAO PAULO',
    uf: 'SP',
    numeroDocumento: 'NF0000125',
    nossoNumero: '00012345003',
    amount: 500.0,
    vencimento: { d: 31, m: 12, y: 2026 },
    emissao: { d: 17, m: 12, y: 2026 },
  },
]

// ---------- montagem das linhas ----------

// Zona 33-52 do Header de Arquivo / 34-53 do Header de Lote é reservada para uso exclusivo de cada
// banco (padrão FEBRABAN) — o Bradesco usa essa faixa para um "código do cliente" composto por
// carteira+agência+conta+dv (comparativo-cnab240-bradesco.md, seção 5.3). Sem uma fonte independente
// que detalhe a subdivisão exata de bytes dentro da faixa, uso uma composição razoável que soma 20.
function codigoClienteBradesco(): string {
  const carteira = cedente.carteira.padStart(1, '0')
  const agencia = cedente.agencia.padStart(5, '0')
  const conta = cedente.conta.padStart(12, '0')
  const dv = cedente.contaDv.padStart(2, ' ')
  return (carteira + agencia + conta + dv).padEnd(20, ' ').slice(0, 20)
}

// Bloco 38-57 do Segmento P ("Identificação do Título") — oficialmente subdividido pelo manual em
// Identificação do Produto (38-40), Zeros (41-45), Nosso Número (46-56) e DV do Nosso Número (57)
// (comparativo-cnab240-bradesco.md, seção 6).
function identificacaoTitulo(nossoNumero: string, dv: string): string {
  const identificacaoProduto = '1'.padStart(3, '0')
  const zeros = '0'.repeat(5)
  const nn = nossoNumero.padStart(11, '0')
  return identificacaoProduto + zeros + nn + dv.slice(0, 1)
}

const lines: string[] = []

const dataGeracao = { d: 1, m: 7, y: 2026 }

// Header de Arquivo
lines.push(
  buildLine(HEADER_ARQUIVO, {
    controle_lote: 0,
    controle_registro: 0,
    cedente_inscricao_tipo: 2,
    cedente_inscricao_numero: cedente.cnpj,
    cedente_convenio: codigoClienteBradesco(),
    cedente_agencia: cedente.agencia,
    cedente_agencia_dv: cedente.agenciaDv,
    cedente_conta: cedente.conta,
    cedente_conta_dv: cedente.contaDv,
    cedente_nome: cedente.nome,
    nome_do_banco: 'BRADESCO',
    arquivo_codigo: 1,
    arquivo_data_de_geracao: ddmmaaaa(dataGeracao.d, dataGeracao.m, dataGeracao.y),
    arquivo_hora_de_geracao: '143000',
    arquivo_sequencia: 1,
    arquivo_layout: 84,
    arquivo_densidade: 1600,
  }),
)

// Header de Lote (Cobrança)
lines.push(
  buildLine(HEADER_LOTE, {
    controle_lote: 1,
    controle_registro: 1,
    servico_operacao: 'R',
    servico_servico: 1,
    servico_layout: 42,
    cedente_inscricao_tipo: 2,
    cedente_inscricao_numero: cedente.cnpj,
    cedente_convenio: codigoClienteBradesco(),
    cedente_agencia: cedente.agencia,
    cedente_agencia_dv: cedente.agenciaDv,
    cedente_conta: cedente.conta,
    cedente_conta_dv: cedente.contaDv,
    cedente_nome: cedente.nome,
    controlecob_numero: 1,
    controlecob_data_gravacao: ddmmaaaa(dataGeracao.d, dataGeracao.m, dataGeracao.y),
    data_credito_hd_lote: 0,
  }),
)

let numeroRegistro = 2 // header de lote já usou o 1

for (const titulo of titulos) {
  numeroRegistro += 1
  const segPRegistro = numeroRegistro

  lines.push(
    buildLine(SEGMENTO_P, {
      controle_lote: 1,
      controle_registro: 3,
      servico_numero_registro: segPRegistro,
      servico_codigo_movimento: 1, // 01 = Entrada de título
      cedente_agencia: cedente.agencia,
      cedente_agencia_dv: cedente.agenciaDv,
      cedente_conta: cedente.conta,
      cedente_conta_dv: cedente.contaDv,
      identificacao_titulo_banco: identificacaoTitulo(titulo.nossoNumero, '0'),
      cobranca_carteira: cedente.carteira,
      cobranca_cadastramento: 1,
      cobranca_documentoTipo: 2,
      cobranca_emissaoBloqueto: 2,
      cobranca_distribuicaoBloqueto: 1,
      numero_documento: titulo.numeroDocumento,
      vencimento_titulo: ddmmaaaa(titulo.vencimento.d, titulo.vencimento.m, titulo.vencimento.y),
      valor_titulo: titulo.amount,
      agencia_cobradora: 0,
      especie_titulo: 1, // 01 = Duplicata Mercantil
      aceite_titulo: 'N',
      data_emissao_titulo: ddmmaaaa(titulo.emissao.d, titulo.emissao.m, titulo.emissao.y),
      juros_cod_mora: 3, // isento
      desconto1_cod: 0,
      valor_iof: 0,
      valor_abatimento: 0,
      identificacao_titulo_empresa: titulo.numeroDocumento,
      codigo_protesto: 3, // não protestar
      prazo_protesto: 0,
      codigo_baixa: 1,
      codigo_moeda: 9, // Real
    }),
  )

  numeroRegistro += 1
  const [cepBase, cepSufixo] = [titulo.cep.slice(0, 5), titulo.cep.slice(5)]
  lines.push(
    buildLine(SEGMENTO_Q, {
      controle_lote: 1,
      controle_registro: 3,
      servico_numero_registro: numeroRegistro,
      servico_codigo_movimento: 1,
      sacado_inscricao_tipo: titulo.tipoInscricao,
      sacado_inscricao_numero: titulo.documento,
      sacado_nome: titulo.nomeSacado,
      sacado_endereco: titulo.endereco,
      sacado_bairro: titulo.bairro,
      sacado_cep: cepBase,
      sacado_cep_sufixo: cepSufixo,
      sacado_cidade: titulo.cidade,
      sacado_uf: titulo.uf,
      sacador_inscricao_tipo: 0,
      sacador_inscricao_numero: 0,
      banco_correspondente: 0,
    }),
  )

  numeroRegistro += 1
  lines.push(
    buildLine(SEGMENTO_R, {
      controle_lote: 1,
      controle_registro: 3,
      servico_numero_registro: numeroRegistro,
      servico_codigoMovimento: 1,
      desconto2_cod: 0,
      desconto3_codigo: 0,
      multa_codigo: 2, // percentual
      multa_data: ddmmaaaa(titulo.vencimento.d, titulo.vencimento.m, titulo.vencimento.y),
      multa_percentual: 2.0,
      cod_ocor_pag: 0,
      dados_deb_banco: 0,
      dados_deb_ag: 0,
      dados_deb_cc: 0,
      ident_emissao: 2, // emissão pelo cedente
    }),
  )

  numeroRegistro += 1
  lines.push(
    buildLine(SEGMENTO_S, {
      controle_lote: 1,
      controle_registro: 3,
      servico_numero_registro: numeroRegistro,
      servico_codigo_movimento: 1,
      tipo_impressao: 1,
      numero_linha: 1,
      mensagem: 'APOS O VENCIMENTO COBRAR MULTA DE 2% - TITULO SUJEITO A PROTESTO',
      tipo_fonte: 0,
    }),
  )
}

const totalRegistrosLote = 1 /* header lote */ + titulos.length * 4 + 1 /* trailer lote */
const somaValores = titulos.reduce((sum, t) => sum + t.amount, 0)

// Trailer de Lote (Cobrança)
lines.push(
  buildLine(TRAILER_LOTE, {
    controle_lote: 1,
    controle_registro: 5,
    quantidade_registros: totalRegistrosLote,
    tot_cobranca_simples_qtde: titulos.length,
    cobrancasimples_valor_titulos: somaValores,
    tot_cobranca_vinc_qtde: 0,
    tot_cobranca_vinc_valor: 0,
    tot_cobranca_cauc_qtde_cobr: 0,
    tot_cobranca_cauc_qtde_cart: 0,
    tot_cobranca_desc_qtde_cobr: 0,
    tot_cobranca_desc_valor_cart: 0,
  }),
)

// Trailer de Arquivo
lines.push(
  buildLine(TRAILER_ARQUIVO, {
    controle_lote: 9999,
    controle_registro: 9,
    totais_quantidade_lotes: 1,
    totais_quantidade_registros: lines.length + 1, // +1 porque esta própria linha ainda não foi empilhada
    totais_quantidade_contas_concil: 0,
  }),
)

// ---------- gravar TXT ----------

const eol = '\r\n'
fs.writeFileSync(TXT_PATH, lines.join(eol) + eol, 'latin1')
console.log(`TXT gravado: ${TXT_PATH} (${lines.length} linhas)`)

// ---------- gravar JSON de metadados (valores conhecidos de forma independente, não via parsing) ----------

function documentRawCnab240(documento: string): string {
  // Segmento Q: sacado_inscricao_numero tem 15 posições (19-33)
  return documento.padStart(15, '0')
}

const records = titulos.map((t, index) => ({
  index,
  name: t.nomeSacado,
  document: t.documento,
  documentRaw: documentRawCnab240(t.documento),
  documentType: t.tipoInscricao === 1 ? 'CPF' : 'CNPJ',
  documentTypeCode: String(t.tipoInscricao),
  amount: t.amount,
  amountRaw: String(Math.round(t.amount * 100)).padStart(15, '0'),
  dueDate: `${String(t.vencimento.d).padStart(2, '0')}/${String(t.vencimento.m).padStart(2, '0')}/${t.vencimento.y}`,
  dueDateRaw: ddmmaaaa(t.vencimento.d, t.vencimento.m, t.vencimento.y),
  address: t.endereco,
  city: t.cidade,
  state: t.uf,
  zipCode: `${t.cep.slice(0, 5)}-${t.cep.slice(5)}`,
}))

const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)

const metadata = {
  description:
    'Remessa CNAB 240 Bradesco com 3 títulos de teste — Header de Arquivo, Header de Lote, Segmentos P/Q/R/S completos e Trailers (fixture reconstruída a partir de fontes independentes do schema: pycnab240, comparativo-cnab240-bradesco.md e o manual oficial Bradesco)',
  bankCode: '237',
  bankName: 'Bradesco',
  format: 'CNAB240',
  structure: {
    totalLines: lines.length,
    headerLines: 2,
    detailLines: titulos.length * 4,
    trailerLines: 2,
    batchCount: 1,
  },
  header: {
    cedenteNome: cedente.nome,
    dataGeracao: `${String(dataGeracao.d).padStart(2, '0')}/${String(dataGeracao.m).padStart(2, '0')}/${dataGeracao.y}`,
    dataGeracaoRaw: ddmmaaaa(dataGeracao.d, dataGeracao.m, dataGeracao.y),
    tipoArquivo: '1',
  },
  records,
  totals: {
    recordCount: records.length,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  },
}

fs.writeFileSync(JSON_PATH, JSON.stringify(metadata, null, 2) + '\n', 'utf-8')
console.log(`JSON gravado: ${JSON_PATH}`)
console.log('Cedente CNPJ:', cedente.cnpj)
titulos.forEach((t) => console.log(t.nomeSacado, t.documento))
