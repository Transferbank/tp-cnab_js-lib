/**
 * Testes do Segmento Y-50 - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Segmento Y-50 (Rateio de Crédito).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Tamanhos e decimais
 * 
 * NÃO testam regras de negócio (soma dos rateios, validação de contas, etc.)
 * 
 * NOTA: Este segmento é opcional e pode ocorrer várias vezes por título, permitindo
 * distribuir o valor recebido entre múltiplas contas por percentual ou valor fixo.
 */

import { bradescoCnab240 } from '../../../../../src/banks/bradesco/schemas/cnab240'
import { extractLineFields } from '../../../../../src/parser/field-extractor'

// Buscar segmento Y50 de optionalRecords
const segmentoY50 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y50')?.schema
if (!segmentoY50) {
  throw new Error('Segmento Y50 não encontrado em optionalRecords')
}

describe('Schema Bradesco CNAB 240 - Segmento Y-50', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = segmentoY50.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      const field = segmentoY50.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('3')
    })

    test('deve ter identificador do segmento "Y" na posição 14', () => {
      const field = segmentoY50.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('Y')
    })

    test('deve ter código de registro opcional "50" na posição 18-19', () => {
      const field = segmentoY50.codigo_registro_opcional
      
      expect(field.pos).toEqual([18, 19])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('50')
    })

    test('deve ter dados da conta de rateio nas posições 20-39', () => {
      expect(segmentoY50.rateio_agencia.pos).toEqual([20, 24])
      expect(segmentoY50.rateio_agencia_dv.pos).toEqual([25, 25])
      expect(segmentoY50.rateio_conta.pos).toEqual([26, 37])
      expect(segmentoY50.rateio_conta_dv.pos).toEqual([38, 38])
      expect(segmentoY50.rateio_agencia_conta_dv.pos).toEqual([39, 39])
    })

    test('deve ter identificação do título no banco na posição 40-59', () => {
      const field = segmentoY50.identificacao_titulo_banco
      
      expect(field.pos).toEqual([40, 59])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(20)
    })

    test('deve ter código de cálculo do rateio na posição 60', () => {
      const field = segmentoY50.codigo_calculo_rateio
      
      expect(field.pos).toEqual([60, 60])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
    })

    test('deve ter tipo do valor informado na posição 61', () => {
      const field = segmentoY50.tipo_valor_informado
      
      expect(field.pos).toEqual([61, 61])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
    })

    test('deve ter valor ou percentual do rateio na posição 62-76 com 2 decimais', () => {
      const field = segmentoY50.valor_ou_percentual_rateio
      
      expect(field.pos).toEqual([62, 76])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.decimals).toBe(2)
      expect(field.description).toContain('percentual')
    })

    test('deve ter código do banco de crédito na posição 77-79', () => {
      const field = segmentoY50.codigo_banco_credito
      
      expect(field.pos).toEqual([77, 79])
      expect(field.type).toBe('num')
      expect(field.size).toBe(3)
    })

    test('deve ter dados da conta de crédito do rateio nas posições 80-99', () => {
      expect(segmentoY50.rateio_credito_agencia.pos).toEqual([80, 84])
      expect(segmentoY50.rateio_credito_agencia_dv.pos).toEqual([85, 85])
      expect(segmentoY50.rateio_credito_conta.pos).toEqual([86, 97])
      expect(segmentoY50.rateio_credito_conta_dv.pos).toEqual([98, 98])
      expect(segmentoY50.rateio_credito_agencia_conta_dv.pos).toEqual([99, 99])
    })

    test('deve ter nome do beneficiário do rateio na posição 100-139', () => {
      const field = segmentoY50.nome_beneficiario_rateio
      
      expect(field.pos).toEqual([100, 139])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter identificação da parcela na posição 140-145', () => {
      const field = segmentoY50.identificacao_parcela
      
      expect(field.pos).toEqual([140, 145])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
    })

    test('deve ter floating em dias de crédito na posição 146-148', () => {
      const field = segmentoY50.floating_dias_credito
      
      expect(field.pos).toEqual([146, 148])
      expect(field.type).toBe('num')
      expect(field.size).toBe(3)
    })

    test('deve ter data de crédito na posição 149-156', () => {
      const field = segmentoY50.data_credito
      
      expect(field.pos).toEqual([149, 156])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAAAA')
      expect(field.size).toBe(8)
    })

    test('deve ter motivo de ocorrência na posição 157-166', () => {
      const field = segmentoY50.motivo_ocorrencia
      
      expect(field.pos).toEqual([157, 166])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(10)
    })

    test('deve ter 29 campos definidos no total', () => {
      const campos = Object.keys(segmentoY50)
      expect(campos.length).toBe(29)
    })
  })

  describe('Parsing de linha sintética', () => {
    test('deve extrair dados de rateio por percentual corretamente', () => {
      // Linha sintética com rateio de 30% do valor
      const linha = '237' + // banco (pos 1-3)
                    '0001' + // lote (pos 4-7)
                    '3' + // tipo registro (pos 8)
                    '00001' + // número registro (pos 9-13)
                    'Y' + // segmento (pos 14)
                    ' ' + // cnab (pos 15)
                    '01' + // código movimento (pos 16-17)
                    '50' + // código registro opcional (pos 18-19)
                    '01234' + // rateio agência (pos 20-24)
                    '5' + // rateio agência DV (pos 25)
                    '000012345678' + // rateio conta (pos 26-37)
                    '9' + // rateio conta DV (pos 38)
                    '0' + // rateio ag/conta DV (pos 39)
                    '09'.padEnd(20, '0') + // identificação título banco (pos 40-59)
                    '1' + // código cálculo = cliente (pos 60)
                    '1' + // tipo valor = percentual (pos 61)
                    '000000000003000' + // valor/percentual (pos 62-76) = 30%
                    '237' + // banco crédito (pos 77-79)
                    '05678' + // crédito agência (pos 80-84)
                    '6' + // crédito agência DV (pos 85)
                    '000087654321' + // crédito conta (pos 86-97)
                    '0' + // crédito conta DV (pos 98)
                    '1' + // crédito ag/conta DV (pos 99)
                    'MARIA DA SILVA                          ' + // nome beneficiário (pos 100-139)
                    '000001' + // identificação parcela (pos 140-145)
                    '005' + // floating dias (pos 146-148)
                    '15072026' + // data crédito (pos 149-156)
                    '          ' + // motivo ocorrência (pos 157-166)
                    ''.padEnd(74, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.controle_banco.value).toBe(237)
      expect(segY50.servico_segmento.value).toBe('Y')
      expect(segY50.codigo_registro_opcional.value).toBe(50)
      expect(segY50.rateio_agencia.value).toBe(1234)
      expect(segY50.rateio_agencia_dv.value).toBe('5')
      expect(segY50.rateio_conta.value).toBe(12345678)
      expect(segY50.rateio_conta_dv.value).toBe('9')
      expect(segY50.codigo_calculo_rateio.value).toBe(1)
      expect(segY50.tipo_valor_informado.value).toBe(1)
      expect(segY50.valor_ou_percentual_rateio.value).toBe(30.00)
      expect(segY50.codigo_banco_credito.value).toBe(237)
      expect(segY50.rateio_credito_agencia.value).toBe(5678)
      expect(segY50.rateio_credito_conta.value).toBe(87654321)
      expect(segY50.nome_beneficiario_rateio.value).toContain('MARIA DA SILVA')
      expect(segY50.identificacao_parcela.value).toBe(1)
      expect(segY50.floating_dias_credito.value).toBe(5)
      expect(segY50.data_credito.raw).toBe('15072026')
      
      expect(segY50.controle_banco.error).toBeFalsy()
      expect(segY50.valor_ou_percentual_rateio.error).toBeFalsy()
    })

    test('deve extrair dados de rateio por valor fixo', () => {
      const linha = '237'.padEnd(59, '0') + 
                    '1' + // código cálculo = cliente (pos 60)
                    '2' + // tipo valor = valor fixo (pos 61)
                    '000000000150000' + // valor fixo (pos 62-76) = R$ 1.500,00
                    ''.padEnd(164, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.codigo_calculo_rateio.value).toBe(1)
      expect(segY50.tipo_valor_informado.value).toBe(2)
      expect(segY50.valor_ou_percentual_rateio.value).toBe(1500.00)
      expect(segY50.valor_ou_percentual_rateio.error).toBeFalsy()
    })

    test('deve extrair percentual com 2 decimais', () => {
      const linha = '237'.padEnd(61, '0') + 
                    '000000000002567' + // percentual (pos 62-76) = 25,67%
                    ''.padEnd(164, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.valor_ou_percentual_rateio.value).toBe(25.67)
      expect(segY50.valor_ou_percentual_rateio.error).toBeFalsy()
    })

    test('deve extrair dados da conta de crédito', () => {
      const linha = '237'.padEnd(76, '0') + 
                    '033' + // banco = Santander (pos 77-79)
                    '12345' + // agência (pos 80-84)
                    '6' + // agência DV (pos 85)
                    '000098765432' + // conta (pos 86-97)
                    '1' + // conta DV (pos 98)
                    '0' + // ag/conta DV (pos 99)
                    ''.padEnd(141, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.codigo_banco_credito.value).toBe(33)
      expect(segY50.rateio_credito_agencia.value).toBe(12345)
      expect(segY50.rateio_credito_agencia_dv.value).toBe('6')
      expect(segY50.rateio_credito_conta.value).toBe(98765432)
      expect(segY50.rateio_credito_conta_dv.value).toBe('1')
      expect(segY50.codigo_banco_credito.error).toBeFalsy()
    })

    test('deve extrair nome do beneficiário do rateio', () => {
      const linha = '237'.padEnd(99, '0') + 
                    'JOAO PEDRO DA COSTA SILVA               ' + // nome (pos 100-139)
                    ''.padEnd(101, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.nome_beneficiario_rateio.value).toContain('JOAO PEDRO DA COSTA SILVA')
      expect(segY50.nome_beneficiario_rateio.error).toBeFalsy()
    })

    test('deve extrair identificação da parcela', () => {
      const linha = '237'.padEnd(139, '0') + 
                    '000012' + // parcela 12 de 12 (pos 140-145)
                    ''.padEnd(95, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.identificacao_parcela.value).toBe(12)
      expect(segY50.identificacao_parcela.error).toBeFalsy()
    })

    test('deve extrair floating e data de crédito', () => {
      const linha = '237'.padEnd(145, '0') + 
                    '010' + // floating = 10 dias (pos 146-148)
                    '20072026' + // data crédito (pos 149-156)
                    ''.padEnd(84, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.floating_dias_credito.value).toBe(10)
      expect(segY50.data_credito.raw).toBe('20072026')
      expect(segY50.floating_dias_credito.error).toBeFalsy()
      expect(segY50.data_credito.error).toBeFalsy()
    })

    test('deve extrair motivo de ocorrência', () => {
      const linha = '237'.padEnd(156, '0') + 
                    'AG0001    ' + // motivo (pos 157-166)
                    ''.padEnd(74, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.motivo_ocorrencia.value).toContain('AG0001')
      expect(segY50.motivo_ocorrencia.error).toBeFalsy()
    })

    test('deve extrair identificação do título no banco (campo único de 20 posições)', () => {
      const linha = '237'.padEnd(39, '0') + 
                    '09123456789012345678' + // identificação título (pos 40-59) = carteira + nosso número
                    ''.padEnd(181, ' ') // resto até 240

      const segY50 = extractLineFields(linha, segmentoY50)

      expect(segY50.identificacao_titulo_banco.value).toContain('09123456789012345678')
      expect(segY50.identificacao_titulo_banco.size).toBe(20)
      expect(segY50.identificacao_titulo_banco.error).toBeFalsy()
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      const schema = segmentoY50
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        
        expect(field.pos).toBeDefined()
        expect(field.pos.length).toBe(2)
        expect(field.type).toBeDefined()
        expect(field.size).toBeDefined()
        expect(field.size).toBeGreaterThan(0)
      })
    })

    test('tamanhos declarados devem bater com as posições', () => {
      const schema = segmentoY50
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        const [inicio, fim] = field.pos
        const tamanhoCalculado = fim - inicio + 1
        
        expect(tamanhoCalculado).toBe(field.size)
      })
    })

    test('não deve haver sobreposição de posições', () => {
      const schema = segmentoY50
      const fieldNames = Object.keys(schema)
      
      for (let i = 0; i < fieldNames.length; i++) {
        const field1 = schema[fieldNames[i]]
        const [start1, end1] = field1.pos
        
        for (let j = i + 1; j < fieldNames.length; j++) {
          const field2 = schema[fieldNames[j]]
          const [start2, end2] = field2.pos
          
          // Verifica se não há sobreposição
          const overlap = !(end1 < start2 || end2 < start1)
          
          if (overlap) {
            fail(`Sobreposição detectada entre ${fieldNames[i]} (${start1}-${end1}) e ${fieldNames[j]} (${start2}-${end2})`)
          }
        }
      }
    })

    test('deve cobrir todas as 240 posições', () => {
      const schema = segmentoY50
      const positions = new Array(240).fill(false)
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        const [start, end] = field.pos
        
        for (let i = start - 1; i < end; i++) {
          positions[i] = true
        }
      })
      
      const uncoveredPositions = positions
        .map((covered, index) => (covered ? null : index + 1))
        .filter(pos => pos !== null)
      
      if (uncoveredPositions.length > 0) {
        fail(`Posições não cobertas: ${uncoveredPositions.join(', ')}`)
      }
      
      expect(uncoveredPositions.length).toBe(0)
    })
  })
})
