import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabEspecieDoTitulo } from '@cnab/type/cnab-especie-do-titulo'

const FEBRABAN_CNAB240_CODES: Record<string, CnabEspecieDoTitulo> = {
  '01': CnabEspecieDoTitulo.CHEQUE,
  '02': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
  '03': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL_POR_INDICACAO,
  '04': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
  '05': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO_POR_INDICACAO,
  '06': CnabEspecieDoTitulo.DUPLICATA_RURAL,
  '07': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
  '08': CnabEspecieDoTitulo.NOTA_DE_CREDITO_COMERCIAL,
  '09': CnabEspecieDoTitulo.NOTA_DE_CREDITO_A_EXPORTACAO,
  '10': CnabEspecieDoTitulo.NOTA_DE_CREDITO_INDUSTRIAL,
  '11': CnabEspecieDoTitulo.NOTA_DE_CREDITO_RURAL,
  '12': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
  '13': CnabEspecieDoTitulo.NOTA_PROMISSORIA_RURAL,
  '14': CnabEspecieDoTitulo.TRIPLICATA_MERCANTIL,
  '15': CnabEspecieDoTitulo.TRIPLICATA_DE_SERVICO,
  '16': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
  '17': CnabEspecieDoTitulo.RECIBO,
  '18': CnabEspecieDoTitulo.FATURA,
  '19': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
  '20': CnabEspecieDoTitulo.APOLICE_DE_SEGURO,
  '21': CnabEspecieDoTitulo.MENSALIDADE_ESCOLAR,
  '22': CnabEspecieDoTitulo.PARCELA_DE_CONSORCIO,
  '23': CnabEspecieDoTitulo.NOTA_FISCAL,
  '24': CnabEspecieDoTitulo.DOCUMENTO_DE_DIVIDA,
  '25': CnabEspecieDoTitulo.CEDULA_DE_PRODUTO_RURAL,
  '26': CnabEspecieDoTitulo.WARRANT,
  '27': CnabEspecieDoTitulo.DIVIDA_ATIVA_DE_ESTADO,
  '28': CnabEspecieDoTitulo.DIVIDA_ATIVA_DE_MUNICIPIO,
  '29': CnabEspecieDoTitulo.DIVIDA_ATIVA_DA_UNIAO,
  '30': CnabEspecieDoTitulo.ENCARGOS_CONDOMINIAIS,
  '31': CnabEspecieDoTitulo.CARTAO_DE_CREDITO,
  '32': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
  '99': CnabEspecieDoTitulo.OUTRO
}

export const CNAB_ESPECIE_DO_TITULO_TABLES: Record<CnabBank, Record<CnabFormat, Record<string, CnabEspecieDoTitulo>>> = {
  [CnabBank.BANCODOBRASIL]: {
    [CnabFormat.CNAB240]: {
      '01': CnabEspecieDoTitulo.CHEQUE,
      '02': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '04': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '06': CnabEspecieDoTitulo.DUPLICATA_RURAL,
      '07': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '12': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '16': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '17': CnabEspecieDoTitulo.RECIBO,
      '19': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '20': CnabEspecieDoTitulo.APOLICE_DE_SEGURO,
      '26': CnabEspecieDoTitulo.WARRANT,
      '27': CnabEspecieDoTitulo.DIVIDA_ATIVA_DE_ESTADO,
      '28': CnabEspecieDoTitulo.DIVIDA_ATIVA_DE_MUNICIPIO,
      '29': CnabEspecieDoTitulo.DIVIDA_ATIVA_DA_UNIAO,
      '31': CnabEspecieDoTitulo.CARTAO_DE_CREDITO,
      '32': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '33': CnabEspecieDoTitulo.BOLETO_DE_DEPOSITO_E_APORTE
    },
    [CnabFormat.CNAB400]: {
      '01': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '02': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '03': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '05': CnabEspecieDoTitulo.RECIBO,
      '08': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '09': CnabEspecieDoTitulo.WARRANT,
      '10': CnabEspecieDoTitulo.CHEQUE,
      '12': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '13': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '15': CnabEspecieDoTitulo.APOLICE_DE_SEGURO,
      '25': CnabEspecieDoTitulo.DIVIDA_ATIVA_DA_UNIAO,
      '26': CnabEspecieDoTitulo.DIVIDA_ATIVA_DE_ESTADO,
      '27': CnabEspecieDoTitulo.DIVIDA_ATIVA_DE_MUNICIPIO,
      '31': CnabEspecieDoTitulo.CARTAO_DE_CREDITO,
      '32': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '33': CnabEspecieDoTitulo.BOLETO_DE_DEPOSITO_E_APORTE
    }
  },
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: {
      ...FEBRABAN_CNAB240_CODES,
      '33': CnabEspecieDoTitulo.BOLETO_DE_DEPOSITO_E_APORTE
    },
    [CnabFormat.CNAB400]: {
      '01': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '02': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '03': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '05': CnabEspecieDoTitulo.RECIBO,
      '10': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '11': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '12': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '31': CnabEspecieDoTitulo.CARTAO_DE_CREDITO,
      '32': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '33': CnabEspecieDoTitulo.BOLETO_DE_DEPOSITO_E_APORTE,
      '99': CnabEspecieDoTitulo.OUTRO
    }
  },
  [CnabBank.CAIXA]: {
    [CnabFormat.CNAB240]: {
      ...FEBRABAN_CNAB240_CODES,
      '33': CnabEspecieDoTitulo.BOLETO_DE_DEPOSITO_E_APORTE
    },
    [CnabFormat.CNAB400]: {
      '01': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '02': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '03': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '04': CnabEspecieDoTitulo.CHEQUE,
      '05': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '06': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '07': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL_POR_INDICACAO,
      '08': CnabEspecieDoTitulo.NOTA_DE_CREDITO_COMERCIAL,
      '09': CnabEspecieDoTitulo.OUTRO,
      '10': CnabEspecieDoTitulo.NOTA_DE_CREDITO_INDUSTRIAL,
      '11': CnabEspecieDoTitulo.NOTA_DE_CREDITO_RURAL,
      '12': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO_POR_INDICACAO,
      '13': CnabEspecieDoTitulo.NOTA_PROMISSORIA_RURAL,
      '14': CnabEspecieDoTitulo.TRIPLICATA_MERCANTIL,
      '15': CnabEspecieDoTitulo.TRIPLICATA_DE_SERVICO,
      '16': CnabEspecieDoTitulo.DUPLICATA_RURAL,
      '17': CnabEspecieDoTitulo.RECIBO,
      '18': CnabEspecieDoTitulo.FATURA,
      '19': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '20': CnabEspecieDoTitulo.APOLICE_DE_SEGURO,
      '21': CnabEspecieDoTitulo.MENSALIDADE_ESCOLAR,
      '22': CnabEspecieDoTitulo.PARCELA_DE_CONSORCIO,
      '23': CnabEspecieDoTitulo.NOTA_FISCAL,
      '24': CnabEspecieDoTitulo.DOCUMENTO_DE_DIVIDA,
      '25': CnabEspecieDoTitulo.CEDULA_DE_PRODUTO_RURAL,
      '26': CnabEspecieDoTitulo.NOTA_DE_CREDITO_A_EXPORTACAO,
      '30': CnabEspecieDoTitulo.ENCARGOS_CONDOMINIAIS,
      '31': CnabEspecieDoTitulo.CARTAO_DE_CREDITO,
      '32': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA
    }
  },
  [CnabBank.ITAU]: {
    [CnabFormat.CNAB240]: {
      '01': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '02': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '03': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '04': CnabEspecieDoTitulo.MENSALIDADE_ESCOLAR,
      '05': CnabEspecieDoTitulo.RECIBO,
      '06': CnabEspecieDoTitulo.CONTRATO,
      '07': CnabEspecieDoTitulo.COSSEGUROS,
      '08': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '09': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '13': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '15': CnabEspecieDoTitulo.DOCUMENTO_DE_DIVIDA,
      '16': CnabEspecieDoTitulo.ENCARGOS_CONDOMINIAIS,
      '17': CnabEspecieDoTitulo.CONTA_DE_PRESTACAO_DE_SERVICOS,
      '18': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '99': CnabEspecieDoTitulo.OUTRO
    },
    [CnabFormat.CNAB400]: {
      '01': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '02': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '03': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '04': CnabEspecieDoTitulo.MENSALIDADE_ESCOLAR,
      '05': CnabEspecieDoTitulo.RECIBO,
      '06': CnabEspecieDoTitulo.CONTRATO,
      '07': CnabEspecieDoTitulo.COSSEGUROS,
      '08': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '09': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '13': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '15': CnabEspecieDoTitulo.DOCUMENTO_DE_DIVIDA,
      '16': CnabEspecieDoTitulo.ENCARGOS_CONDOMINIAIS,
      '17': CnabEspecieDoTitulo.CONTA_DE_PRESTACAO_DE_SERVICOS,
      '18': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '99': CnabEspecieDoTitulo.OUTRO
    }
  },
  [CnabBank.SANTANDER]: {
    [CnabFormat.CNAB240]: {
      '02': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '04': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '07': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '12': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '13': CnabEspecieDoTitulo.NOTA_PROMISSORIA_RURAL,
      '17': CnabEspecieDoTitulo.RECIBO,
      '20': CnabEspecieDoTitulo.APOLICE_DE_SEGURO,
      '30': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '31': CnabEspecieDoTitulo.CARTAO_DE_CREDITO,
      '32': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '33': CnabEspecieDoTitulo.BOLETO_DE_DEPOSITO_E_APORTE,
      '97': CnabEspecieDoTitulo.CHEQUE,
      '98': CnabEspecieDoTitulo.NOTA_PROMISSORIA_DIRETA
    },
    [CnabFormat.CNAB400]: {
      '01': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '02': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '03': CnabEspecieDoTitulo.APOLICE_DE_SEGURO,
      '05': CnabEspecieDoTitulo.RECIBO,
      '06': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '07': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '08': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '19': CnabEspecieDoTitulo.CARTAO_DE_CREDITO,
      '33': CnabEspecieDoTitulo.BOLETO_DE_DEPOSITO_E_APORTE
    }
  },
  [CnabBank.SICOOB]: {
    [CnabFormat.CNAB240]: {
      '01': CnabEspecieDoTitulo.CHEQUE,
      '02': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '03': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL_POR_INDICACAO,
      '04': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '05': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO_POR_INDICACAO,
      '06': CnabEspecieDoTitulo.DUPLICATA_RURAL,
      '07': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '08': CnabEspecieDoTitulo.NOTA_DE_CREDITO_COMERCIAL,
      '09': CnabEspecieDoTitulo.NOTA_DE_CREDITO_A_EXPORTACAO,
      '10': CnabEspecieDoTitulo.NOTA_DE_CREDITO_INDUSTRIAL,
      '11': CnabEspecieDoTitulo.NOTA_DE_CREDITO_RURAL,
      '12': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '13': CnabEspecieDoTitulo.NOTA_PROMISSORIA_RURAL,
      '14': CnabEspecieDoTitulo.TRIPLICATA_MERCANTIL,
      '15': CnabEspecieDoTitulo.TRIPLICATA_DE_SERVICO,
      '16': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '17': CnabEspecieDoTitulo.RECIBO,
      '18': CnabEspecieDoTitulo.FATURA,
      '19': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '20': CnabEspecieDoTitulo.APOLICE_DE_SEGURO,
      '21': CnabEspecieDoTitulo.MENSALIDADE_ESCOLAR,
      '22': CnabEspecieDoTitulo.PARCELA_DE_CONSORCIO,
      '23': CnabEspecieDoTitulo.NOTA_FISCAL,
      '24': CnabEspecieDoTitulo.DOCUMENTO_DE_DIVIDA,
      '25': CnabEspecieDoTitulo.CEDULA_DE_PRODUTO_RURAL,
      '31': CnabEspecieDoTitulo.CARTAO_DE_CREDITO,
      '32': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '99': CnabEspecieDoTitulo.OUTRO
    },
    [CnabFormat.CNAB400]: {
      '01': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL,
      '02': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '03': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '05': CnabEspecieDoTitulo.RECIBO,
      '06': CnabEspecieDoTitulo.DUPLICATA_RURAL,
      '08': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '09': CnabEspecieDoTitulo.WARRANT,
      '10': CnabEspecieDoTitulo.CHEQUE,
      '12': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO,
      '13': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '14': CnabEspecieDoTitulo.TRIPLICATA_MERCANTIL,
      '15': CnabEspecieDoTitulo.TRIPLICATA_DE_SERVICO,
      '18': CnabEspecieDoTitulo.FATURA,
      '20': CnabEspecieDoTitulo.APOLICE_DE_SEGURO,
      '21': CnabEspecieDoTitulo.MENSALIDADE_ESCOLAR,
      '22': CnabEspecieDoTitulo.PARCELA_DE_CONSORCIO,
      '99': CnabEspecieDoTitulo.OUTRO
    }
  },
  [CnabBank.SICREDI]: {
    [CnabFormat.CNAB240]: {
      '03': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL_POR_INDICACAO,
      '05': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO_POR_INDICACAO,
      '06': CnabEspecieDoTitulo.DUPLICATA_RURAL,
      '07': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      '12': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      '13': CnabEspecieDoTitulo.NOTA_PROMISSORIA_RURAL,
      '16': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      '17': CnabEspecieDoTitulo.RECIBO,
      '19': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      '32': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA,
      '99': CnabEspecieDoTitulo.OUTRO
    },
    [CnabFormat.CNAB400]: {
      'A': CnabEspecieDoTitulo.DUPLICATA_MERCANTIL_POR_INDICACAO,
      'B': CnabEspecieDoTitulo.DUPLICATA_RURAL,
      'C': CnabEspecieDoTitulo.NOTA_PROMISSORIA,
      'D': CnabEspecieDoTitulo.NOTA_PROMISSORIA_RURAL,
      'E': CnabEspecieDoTitulo.NOTA_DE_SEGURO,
      'G': CnabEspecieDoTitulo.RECIBO,
      'H': CnabEspecieDoTitulo.LETRA_DE_CAMBIO,
      'I': CnabEspecieDoTitulo.NOTA_DE_DEBITO,
      'J': CnabEspecieDoTitulo.DUPLICATA_DE_SERVICO_POR_INDICACAO,
      'K': CnabEspecieDoTitulo.OUTRO,
      'O': CnabEspecieDoTitulo.BOLETO_DE_PROPOSTA
    }
  }
}

export function getEspecieCodes(bank: CnabBank, format: CnabFormat): Record<string, CnabEspecieDoTitulo> {
  return CNAB_ESPECIE_DO_TITULO_TABLES[bank][format]
}

export function getEspecieDoTitulo(bank: CnabBank, format: CnabFormat, codigo: string | null): CnabEspecieDoTitulo | null {
  if (codigo == null) return null
  return getEspecieCodes(bank, format)[codigo] ?? CnabEspecieDoTitulo.OUTRO
}
