/**
 * Testes do Segmento P - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Segmento P (dados financeiros do t�tulo).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posi��es corretas dos campos
 * - Extra��o correta dos valores
 * - Tipos de dados corretos
 * 
 * N�O testam regras de neg�cio (datas passadas, valores zero, etc.)
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'
import { loadFixtureMetadata } from '../../../../../tests/helpers/fixture-metadata'
import { readFixture, findSegmentLines } from './shared'
import { CNABFormatCode } from '@tp-types/index'

describe('Schema Bradesco CNAB 240 - Segmento P', () => {
  describe('Defini��o dos campos', () => {
    test('deve ter c�digo do banco na posi��o 1-3 com padr�o "237"', () => {
      const field = bradescoCnab240.segmentoP!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter lote na posi��o 4-7', () => {
      const field = bradescoCnab240.segmentoP!.controle_lote
      
      expect(field.pos).toEqual([4, 7])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de registro "3" (detalhe) na posi��o 8', () => {
      const field = bradescoCnab240.segmentoP!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('3')
    })

    test('deve ter n�mero sequencial do registro na posi��o 9-13', () => {
      const field = bradescoCnab240.segmentoP!.servico_numero_registro
      
      expect(field.pos).toEqual([9, 13])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter identificador do segmento "P" na posi��o 14', () => {
      const field = bradescoCnab240.segmentoP!.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('P')
    })

    test('deve ter c�digo de movimento na posi��o 16-17', () => {
      const field = bradescoCnab240.segmentoP!.servico_codigo_movimento
      
      expect(field.pos).toEqual([16, 17])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter campo CNAB exclusivo na posi��o 15', () => {
      const field = bradescoCnab240.segmentoP!.cnab_exclusivo_1
      
      expect(field.pos).toEqual([15, 15])
      expect(field.type).toBe('alfa')
      expect(field.required).toBe(false)
    })

    test('deve ter dados do cedente nas posi��es 18-36', () => {
      expect(bradescoCnab240.segmentoP!.cedente_agencia.pos).toEqual([18, 22])
      expect(bradescoCnab240.segmentoP!.cedente_agencia_dv.pos).toEqual([23, 23])
      expect(bradescoCnab240.segmentoP!.cedente_conta.pos).toEqual([24, 35])
      expect(bradescoCnab240.segmentoP!.cedente_conta_dv.pos).toEqual([36, 36])
    })

    test('deve ter d�gito verificador da ag�ncia/conta na posi��o 37', () => {
      const field = bradescoCnab240.segmentoP!.cedente_agencia_conta_dv
      
      expect(field.pos).toEqual([37, 37])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
      expect(field.description).toContain('D�gito verificador da ag�ncia/conta')
    })

    test('deve ter identifica��o do t�tulo no banco na posi��o 38-57', () => {
      const field = bradescoCnab240.segmentoP!.identificacao_titulo_banco
      
      expect(field.pos).toEqual([38, 57])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(20)
      expect(field.required).toBe(true)
    })

    test('deve ter c�digo da carteira na posi��o 58', () => {
      const field = bradescoCnab240.segmentoP!.cobranca_carteira
      
      expect(field.pos).toEqual([58, 58])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter dados de cadastramento/emiss�o do bloqueto nas posi��es 59-62', () => {
      expect(bradescoCnab240.segmentoP!.cobranca_cadastramento.pos).toEqual([59, 59])
      expect(bradescoCnab240.segmentoP!.cobranca_cadastramento.type).toBe('num')
      expect(bradescoCnab240.segmentoP!.cobranca_cadastramento.description).toContain('Forma de cadastramento')
      
      expect(bradescoCnab240.segmentoP!.cobranca_documento_tipo.pos).toEqual([60, 60])
      expect(bradescoCnab240.segmentoP!.cobranca_documento_tipo.type).toBe('num')
      expect(bradescoCnab240.segmentoP!.cobranca_documento_tipo.description).toContain('Tipo de documento')
      
      expect(bradescoCnab240.segmentoP!.cobranca_emissao_bloqueto.pos).toEqual([61, 61])
      expect(bradescoCnab240.segmentoP!.cobranca_emissao_bloqueto.type).toBe('num')
      expect(bradescoCnab240.segmentoP!.cobranca_emissao_bloqueto.pattern).toBe('2')
      expect(bradescoCnab240.segmentoP!.cobranca_emissao_bloqueto.description).toContain('Identifica��o da emiss�o')
      
      expect(bradescoCnab240.segmentoP!.cobranca_distribuicao_bloqueto.pos).toEqual([62, 62])
      expect(bradescoCnab240.segmentoP!.cobranca_distribuicao_bloqueto.type).toBe('num')
      expect(bradescoCnab240.segmentoP!.cobranca_distribuicao_bloqueto.description).toContain('Identifica��o da distribui��o')
    })

    test('deve ter n�mero do documento na posi��o 63-77', () => {
      const field = bradescoCnab240.segmentoP!.numero_documento
      
      expect(field.pos).toEqual([63, 77])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
    })

    test('deve ter vencimento na posi��o 78-85 com formato DDMMAAAA', () => {
      const field = bradescoCnab240.segmentoP!.vencimento_titulo
      
      expect(field.pos).toEqual([78, 85])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAAAA')
      expect(field.required).toBe(true)
    })

    test('deve ter valor do t�tulo na posi��o 86-100 com 2 decimais', () => {
      const field = bradescoCnab240.segmentoP!.valor_titulo
      
      expect(field.pos).toEqual([86, 100])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter ag�ncia cobradora na posi��o 101-106', () => {
      expect(bradescoCnab240.segmentoP!.agencia_cobradora.pos).toEqual([101, 105])
      expect(bradescoCnab240.segmentoP!.agencia_cobradora_dv.pos).toEqual([106, 106])
    })

    test('deve ter esp�cie do t�tulo na posi��o 107-108', () => {
      const field = bradescoCnab240.segmentoP!.especie_titulo
      
      expect(field.pos).toEqual([107, 108])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
    })

    test('deve ter aceite na posi��o 109', () => {
      const field = bradescoCnab240.segmentoP!.aceite_titulo
      
      expect(field.pos).toEqual([109, 109])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
    })

    test('deve ter data de emiss�o na posi��o 110-117', () => {
      const field = bradescoCnab240.segmentoP!.data_emissao_titulo
      
      expect(field.pos).toEqual([110, 117])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAAAA')
    })

    test('deve ter campos de juros nas posi��es 118-141', () => {
      expect(bradescoCnab240.segmentoP!.juros_codigo.pos).toEqual([118, 118])
      expect(bradescoCnab240.segmentoP!.juros_data.pos).toEqual([119, 126])
      expect(bradescoCnab240.segmentoP!.juros_valor.pos).toEqual([127, 141])
      expect(bradescoCnab240.segmentoP!.juros_valor.decimals).toBe(2)
    })

    test('deve ter campos de desconto nas posi��es 142-165', () => {
      expect(bradescoCnab240.segmentoP!.desconto1_codigo.pos).toEqual([142, 142])
      expect(bradescoCnab240.segmentoP!.desconto1_data.pos).toEqual([143, 150])
      expect(bradescoCnab240.segmentoP!.desconto1_valor.pos).toEqual([151, 165])
      expect(bradescoCnab240.segmentoP!.desconto1_valor.decimals).toBe(2)
    })

    test('deve ter IOF e abatimento nas posi��es 166-195', () => {
      expect(bradescoCnab240.segmentoP!.valor_iof.pos).toEqual([166, 180])
      expect(bradescoCnab240.segmentoP!.valor_iof.decimals).toBe(2)
      expect(bradescoCnab240.segmentoP!.valor_abatimento.pos).toEqual([181, 195])
      expect(bradescoCnab240.segmentoP!.valor_abatimento.decimals).toBe(2)
    })

    test('deve ter identifica��o do t�tulo na empresa na posi��o 196-220', () => {
      const field = bradescoCnab240.segmentoP!.identificacao_titulo_empresa
      
      expect(field.pos).toEqual([196, 220])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(25)
    })

    test('deve ter campos de protesto nas posi��es 221-223', () => {
      expect(bradescoCnab240.segmentoP!.codigo_protesto.pos).toEqual([221, 221])
      expect(bradescoCnab240.segmentoP!.prazo_protesto.pos).toEqual([222, 223])
    })

    test('deve ter campos de baixa nas posi��es 224-227', () => {
      expect(bradescoCnab240.segmentoP!.codigo_baixa.pos).toEqual([224, 224])
      expect(bradescoCnab240.segmentoP!.prazo_baixa.pos).toEqual([225, 227])
    })

    test('deve ter c�digo da moeda na posi��o 228-229', () => {
      const field = bradescoCnab240.segmentoP!.codigo_moeda
      
      expect(field.pos).toEqual([228, 229])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
    })

    test('deve ter n�mero do contrato na posi��o 230-239', () => {
      const field = bradescoCnab240.segmentoP!.numero_contrato
      
      expect(field.pos).toEqual([230, 239])
      expect(field.type).toBe('num')
      expect(field.size).toBe(10)
    })

    test('deve ter campo CNAB exclusivo na posi��o 240', () => {
      const field = bradescoCnab240.segmentoP!.cnab_exclusivo_3
      
      expect(field.pos).toEqual([240, 240])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter 42 campos definidos no total', () => {
      const campos = Object.keys(bradescoCnab240.segmentoP!)
      expect(campos.length).toBe(42)
    })
  })

  describe('Parsing de arquivo real', () => {
    let lines: string[]
    let segPLines: string[]

    beforeAll(() => {
      lines = readFixture('remessa-multipla.txt')
      // Segmentos P s�o localizados pelo conte�do (pos 8 = '3', pos 14 = 'P'), n�o por
      // �ndice fixo, j� que o arquivo tamb�m tem Header de Lote e Segmentos Q/R/S entre eles.
      segPLines = findSegmentLines(lines, 'P')
    })

    test('deve extrair valor correto do primeiro t�tulo (do JSON)', () => {
      const metadata: any = loadFixtureMetadata('bradesco', 'remessa-multipla', CNABFormatCode.CNAB240)
      const record = metadata.records[0]
      const segP = extractLineFields(segPLines[0], bradescoCnab240.segmentoP!)

      expect(segP.valor_titulo.raw).toBe(record.amountRaw)
      expect(segP.valor_titulo.value).toBe(record.amount)
      expect(segP.valor_titulo.error).toBeFalsy()
    })

    test('deve extrair vencimento correto do primeiro t�tulo (do JSON)', () => {
      const metadata: any = loadFixtureMetadata('bradesco', 'remessa-multipla', CNABFormatCode.CNAB240)
      const record = metadata.records[0]
      const segP = extractLineFields(segPLines[0], bradescoCnab240.segmentoP!)

      expect(segP.vencimento_titulo.raw).toBe(record.dueDateRaw)
      expect(segP.vencimento_titulo.error).toBeFalsy()
    })

    test('deve extrair valores corretos de todos os t�tulos (do JSON)', () => {
      const metadata: any = loadFixtureMetadata('bradesco', 'remessa-multipla', CNABFormatCode.CNAB240)

      metadata.records.forEach((expected, index) => {
        const segP = extractLineFields(segPLines[index], bradescoCnab240.segmentoP!)

        expect(segP.valor_titulo.value).toBe(expected.amount)
        expect(segP.valor_titulo.error).toBeFalsy()
      })
    })

    test('deve extrair vencimentos de todos os t�tulos (do JSON)', () => {
      const metadata: any = loadFixtureMetadata('bradesco', 'remessa-multipla', CNABFormatCode.CNAB240)

      metadata.records.forEach((record, index) => {
        const segP = extractLineFields(segPLines[index], bradescoCnab240.segmentoP!)

        expect(segP.vencimento_titulo.raw).toBe(record.dueDateRaw)
        expect(segP.vencimento_titulo.error).toBeFalsy()
      })
    })
  })
})
