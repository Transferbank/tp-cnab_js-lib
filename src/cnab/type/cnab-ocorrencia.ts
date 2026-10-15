import { CnabDuplicatedOcorrenciaCodeException } from '@cnab/exception/cnab-exception'

export enum CnabOcorrencia {
  ENTRADA_CONFIRMADA = 'entrada_confirmada',
  ENTRADA_REJEITADA = 'entrada_rejeitada',
  LIQUIDACAO = 'liquidacao',
  BAIXA = 'baixa',
  ESTORNO = 'estorno',
  PAGAMENTO_PENDENTE = 'pagamento_pendente',
  INSTRUCAO_CONFIRMADA = 'instrucao_confirmada',
  INSTRUCAO_REJEITADA = 'instrucao_rejeitada',
  PROTESTO = 'protesto',
  TARIFA = 'tarifa',
  DDA = 'dda',
  NEGATIVACAO = 'negativacao',
  PIX = 'pix',
  INFORMATIVO = 'informativo',
  OUTRA = 'outra'
}

export const CNAB_OCORRENCIA_DESCRIPTIONS: Record<CnabOcorrencia, string> = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: 'O banco registrou o boleto',
  [CnabOcorrencia.ENTRADA_REJEITADA]: 'O banco recusou o registro do boleto',
  [CnabOcorrencia.LIQUIDACAO]: 'O boleto foi pago',
  [CnabOcorrencia.BAIXA]: 'O boleto saiu da carteira sem pagamento',
  [CnabOcorrencia.ESTORNO]: 'Um pagamento ou uma baixa anterior foi desfeito',
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: 'O pagamento foi recebido, mas ainda não foi efetivado',
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: 'O banco acatou uma instrução ou alteração da remessa',
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: 'O banco recusou uma instrução ou alteração da remessa',
  [CnabOcorrencia.PROTESTO]: 'Movimento do protesto ou do cartório',
  [CnabOcorrencia.TARIFA]: 'Débito de tarifas ou custas',
  [CnabOcorrencia.DDA]: 'Reconhecimento ou recusa do boleto no DDA',
  [CnabOcorrencia.NEGATIVACAO]: 'Inclusão, exclusão ou rejeição de negativação',
  [CnabOcorrencia.PIX]: 'Situação do QR Code Pix do boleto',
  [CnabOcorrencia.INFORMATIVO]: 'Aviso sem efeito no boleto',
  [CnabOcorrencia.OUTRA]: 'Código fora da tabela de ocorrências do banco'
}

export type CnabOcorrenciaTable = Partial<Record<CnabOcorrencia, Record<string, string>>>

export interface CnabOcorrenciaMatch {
  ocorrencia: CnabOcorrencia
  description: string
}

const indexes = new WeakMap<CnabOcorrenciaTable, Map<string, CnabOcorrenciaMatch>>()

function indexTable(table: CnabOcorrenciaTable): Map<string, CnabOcorrenciaMatch> {
  const index = new Map<string, CnabOcorrenciaMatch>()
  for (const [ocorrencia, codes] of Object.entries(table) as Array<[CnabOcorrencia, Record<string, string>]>) {
    for (const [code, description] of Object.entries(codes)) {
      const existing = index.get(code)
      if (existing != null) throw new CnabDuplicatedOcorrenciaCodeException(code, existing.ocorrencia, ocorrencia)
      index.set(code, { ocorrencia, description })
    }
  }
  return index
}

export function findOcorrencia(table: CnabOcorrenciaTable, code: string): CnabOcorrenciaMatch | null {
  let index = indexes.get(table)
  if (index == null) {
    index = indexTable(table)
    indexes.set(table, index)
  }
  return index.get(code) ?? null
}
