#!/usr/bin/env ts-node
/**
 * Script one-off para anonimizar a fixture CNAB 400 do Sicredi (dados reais de
 * empresas reais -> dados fictícios), preservando exatamente a estrutura/posições
 * do layout e recalculando o metadata.json a partir do CRM novo.
 *
 * Uso: npx ts-node scripts/anonymize-sicredi-cnab400-fixture.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '../src/parser/field-extractor'
import { sicrediCnab400 } from '../src/banks/sicredi/schemas/cnab400'

const FIXTURE_DIR = path.join(__dirname, '..', 'tests', 'fixtures', 'cnab400', 'sicredi')
const REM_PATH = path.join(FIXTURE_DIR, 'SICREDI_cnab_400.CRM')
const JSON_PATH = path.join(FIXTURE_DIR, 'SICREDI_cnab_400.json')

// ---------- helpers de baixo nível ----------

function padNum(value: string | number, size: number): string {
  return String(value).replace(/\D/g, '').padStart(size, '0').slice(-size)
}

function padAlfa(value: string, size: number): string {
  return value.toUpperCase().slice(0, size).padEnd(size, ' ')
}

function spliceField(line: string, start: number, end: number, replacement: string): string {
  return line.slice(0, start - 1) + replacement + line.slice(end)
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
  // Base >= 10^11 garante 12 dígitos sem zero à esquerda. Faixa de seed própria
  // do Sicredi (diferente da usada nos outros anonimizadores).
  const base = String(500000000000 + seed * 9973).slice(-12)
  return base + cnpjCheckDigits(base)
}

// ---------- pools de nomes fictícios (mesma convenção dos outros anonimizadores) ----------

const BUSINESS_WORDS = [
  'COMERCIAL',
  'DISTRIBUIDORA',
  'ATACADISTA',
  'BAZAR E PAPELARIA',
  'BAZAR E FERRAGENS',
  'UTILIDADES',
  'VARIEDADES',
  'PRESENTES',
  'CONFECCOES',
  'MAGAZINE',
  'ARMARINHOS',
]

const NAME_TOKENS = [
  'ALFA',
  'BETA',
  'GAMA',
  'DELTA',
  'OMEGA',
  'NOVA ERA',
  'BOA VISTA',
  'PORTO NOVO',
  'VALE VERDE',
  'ESTRELA',
]

const SUFFIXES = ['LTDA', 'LTDA', 'LTDA', 'ME', 'EIRELI']

const FIRST_NAMES = ['JOANA', 'BEATRIZ', 'RAFAELA', 'LARISSA', 'CAMILA', 'GABRIELA', 'VITORIA']
const FAKE_SURNAME_TOKENS = ['EXEMPLO', 'MODELO', 'FICTICIO', 'AMOSTRA', 'GENERICO']

function buildCorpName(index: number): string {
  const word = BUSINESS_WORDS[index % BUSINESS_WORDS.length]
  const token = NAME_TOKENS[Math.floor(index / BUSINESS_WORDS.length) % NAME_TOKENS.length]
  const suffix = SUFFIXES[index % SUFFIXES.length]
  return `${word} ${token} ${suffix}`
}

function buildPersonName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const middle = FAKE_SURNAME_TOKENS[index % FAKE_SURNAME_TOKENS.length]
  const surname = FAKE_SURNAME_TOKENS[(index + 2) % FAKE_SURNAME_TOKENS.length]
  return `${first} ${middle} ${surname} SILVA`
}

function buildAddress(index: number): string {
  const kind = index % 3 === 0 ? 'AV' : 'RUA'
  const num = 100 + index * 13
  return `${kind} EXEMPLO,${num} - CENTRO`
}

// ---------- programa principal ----------

function main() {
  const rawContent = fs.readFileSync(REM_PATH, 'latin1')
  const usesCRLF = rawContent.includes('\r\n')
  const lines = rawContent.split(/\r?\n/).filter((l) => l.length > 0)

  const detailIndexes: number[] = []
  lines.forEach((line, i) => {
    if (line[0] === '1') detailIndexes.push(i)
  })

  console.log(`Total de linhas: ${lines.length}, detalhes (tipo 1): ${detailIndexes.length}`)

  // --- 1. Identidade fictícia do cedente (código de cliente na cooperativa + CNPJ) ---
  const fakeCodigoCliente = '81234'
  const fakeCedenteCnpj = makeFakeCnpj(9001)

  // --- 2. Mapear cada CNPJ real de sacado para uma identidade fictícia ---
  type FakeSacado = { name: string; cnpj: string; address: string }
  const sacadoMap = new Map<string, FakeSacado>()
  let corpCounter = 0
  let personCounter = 0

  const corpSuffixPattern = /(LTDA|COMERCIO|ME|EIRELI)/

  for (const i of detailIndexes) {
    const detail = extractLineFields(lines[i], sicrediCnab400.detail!)
    const realDoc = detail.sacado_numero_inscricao.raw
    const realName = String(detail.nome.value).trim()

    if (!sacadoMap.has(realDoc)) {
      const looksLikeCorp = corpSuffixPattern.test(realName)
      if (looksLikeCorp) {
        sacadoMap.set(realDoc, {
          name: buildCorpName(corpCounter++),
          cnpj: makeFakeCnpj(1000 + sacadoMap.size),
          address: buildAddress(sacadoMap.size),
        })
      } else {
        sacadoMap.set(realDoc, {
          name: buildPersonName(personCounter++),
          cnpj: makeFakeCnpj(1000 + sacadoMap.size),
          address: buildAddress(sacadoMap.size),
        })
      }
    }
  }

  console.log(`Sacados únicos mapeados: ${sacadoMap.size}`)

  // --- 3. Reescrever header ---
  let newHeaderLine = lines[0]
  const hFields = sicrediCnab400.header!
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.codigo_cliente.pos as [number, number]), padNum(fakeCodigoCliente, 5))
  newHeaderLine = spliceField(newHeaderLine, ...(hFields.numero_inscricao_cedente.pos as [number, number]), padNum(fakeCedenteCnpj, 14))
  lines[0] = newHeaderLine

  // --- 4. Reescrever cada linha de detalhe (tipo 1) ---
  const dFields = sicrediCnab400.detail!
  for (const i of detailIndexes) {
    let line = lines[i]
    const detail = extractLineFields(line, dFields)
    const realDoc = detail.sacado_numero_inscricao.raw
    const fake = sacadoMap.get(realDoc)!

    line = spliceField(line, ...(dFields.sacado_numero_inscricao.pos as [number, number]), padNum(fake.cnpj, 14))
    line = spliceField(line, ...(dFields.nome.pos as [number, number]), padAlfa(fake.name, 40))
    line = spliceField(line, ...(dFields.logradouro.pos as [number, number]), padAlfa(fake.address, 40))

    if (line.length !== 400) {
      throw new Error(`Linha ${i} ficou com ${line.length} caracteres (esperado 400)`)
    }

    lines[i] = line
  }

  // --- 5. Reescrever trailer (repete codigo_cliente do header) ---
  const tFields = sicrediCnab400.trailer!
  const trailerIndex = lines.length - 1
  lines[trailerIndex] = spliceField(
    lines[trailerIndex],
    ...(tFields.codigo_cliente.pos as [number, number]),
    padNum(fakeCodigoCliente, 5),
  )

  // --- 6. Gravar novo CRM ---
  const eol = usesCRLF ? '\r\n' : '\n'
  const newContent = lines.join(eol) + eol
  fs.writeFileSync(REM_PATH, newContent, 'latin1')
  console.log(`CRM regravado: ${REM_PATH}`)

  // --- 7. Regerar JSON a partir do CRM novo (mesma forma do arquivo atual) ---
  const newHeaderParsed = extractLineFields(lines[0], hFields)
  const dataGeracaoRaw = String(newHeaderParsed.data_geracao.raw)

  const records = detailIndexes.map((i, idx) => {
    const detail = extractLineFields(lines[i], dFields)
    const documentoRaw = String(detail.sacado_numero_inscricao.raw)
    const tipoInscricao = String(detail.sacado_codigo_inscricao.raw)
    const vencimento = String(detail.vencimento.raw)

    return {
      index: idx + 1,
      name: String(detail.nome.value).trim(),
      document: documentoRaw,
      documentRaw: documentoRaw,
      documentType: tipoInscricao === '1' ? 'CPF' : 'CNPJ',
      documentTypeCode: tipoInscricao,
      amount: Number(detail.valor_titulo.value),
      amountRaw: String(detail.valor_titulo.raw),
      dueDate: vencimento
        ? `${vencimento.slice(0, 2)}/${vencimento.slice(2, 4)}/20${vencimento.slice(4, 6)}`
        : '',
      dueDateRaw: vencimento,
      address: String(detail.logradouro.value).trim(),
      zipCode: (() => {
        const cep = String(detail.cep.raw)
        return cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep
      })(),
      numeroDocumento: String(detail.numero_documento.value).trim(),
      nossoNumero: String(detail.nosso_numero.raw),
      instrucao: String(detail.instrucao.raw),
      especie: String(detail.especie.value).trim(),
    }
  })

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)

  const metadata = {
    description: `Arquivo CNAB 400 Sicredi com ${records.length} títulos - Remessa de cobrança (${lines.length} linhas: 1 header + ${records.length} tipo 1 (detalhe) + 1 trailer, sem registros opcionais) (dados fictícios)`,
    bankCode: '748',
    bankName: 'Sicredi',
    format: 'CNAB400',
    structure: {
      totalLines: lines.length,
      headerLines: 1,
      detailLines: records.length,
      trailerLines: 1,
    },
    header: {
      codigoCliente: String(newHeaderParsed.codigo_cliente.raw),
      numeroInscricaoCedente: String(newHeaderParsed.numero_inscricao_cedente.raw),
      dataGeracao: `${dataGeracaoRaw.slice(6, 8)}/${dataGeracaoRaw.slice(4, 6)}/${dataGeracaoRaw.slice(0, 4)}`,
      dataGeracaoRaw,
      sequencialRemessa: String(newHeaderParsed.sequencial_remessa.raw),
      versaoSistema: String(newHeaderParsed.versao_sistema.value).trim(),
      tipoArquivo: String(newHeaderParsed.tipo_operacao.raw),
    },
    records,
    totals: {
      recordCount: records.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    },
    notes: [
      'Arquivo com dados fictícios (nomes, CNPJs e endereços dos sacados e do cedente foram substituídos)',
      'Nenhum registro opcional presente nesta fixture (tipo 2/5/6/7/8) — todos os detalhes vêm juntos, sem intercalar mensagem/informativo',
      'Header usa "código do cliente" (5 dígitos) em vez de agência+conta',
      'Data de geração do header está em formato AAAAMMDD (8 dígitos)',
    ],
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(metadata, null, 2) + '\n', 'utf-8')
  console.log(`JSON regravado: ${JSON_PATH}`)
  console.log('Primeiro registro:', records[0])
  console.log('Total:', metadata.totals.totalAmount)
}

main()
