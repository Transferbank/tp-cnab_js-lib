/**
 * Testes do Segmento Y-01 - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Segmento Y-01 (Beneficiário Final completo com endereço).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Tamanhos e decimais
 * 
 * NÃO testam regras de negócio (valores válidos, CEP existente, etc.)
 * 
 * NOTA: Este segmento é opcional e diferente do Segmento Q. O Segmento Q contém apenas
 * tipo/número/nome do sacador/avalista, enquanto o Y-01 traz o Beneficiário Final completo
 * com endereço detalhado.
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'

// Buscar segmento Y01 de optionalRecords
const segmentoY01 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y01')?.schema
if (!segmentoY01) {
  throw new Error('Segmento Y01 não encontrado em optionalRecords')
}

describe('Schema Bradesco CNAB 240 - Segmento Y-01', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = segmentoY01.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      const field = segmentoY01.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('3')
    })

    test('deve ter identificador do segmento "Y" na posição 14', () => {
      const field = segmentoY01.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('Y')
    })

    test('deve ter código de registro opcional "01" na posição 18-19', () => {
      const field = segmentoY01.codigo_registro_opcional
      
      expect(field.pos).toEqual([18, 19])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('01')
    })

    test('deve ter tipo de inscrição do beneficiário final na posição 20', () => {
      const field = segmentoY01.beneficiario_final_inscricao_tipo
      
      expect(field.pos).toEqual([20, 20])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
    })

    test('deve ter número de inscrição do beneficiário final na posição 21-35', () => {
      const field = segmentoY01.beneficiario_final_inscricao_numero
      
      expect(field.pos).toEqual([21, 35])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
    })

    test('deve ter nome do beneficiário final na posição 36-75', () => {
      const field = segmentoY01.beneficiario_final_nome
      
      expect(field.pos).toEqual([36, 75])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter endereço do beneficiário final na posição 76-115', () => {
      const field = segmentoY01.beneficiario_final_endereco
      
      expect(field.pos).toEqual([76, 115])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter bairro do beneficiário final na posição 116-130', () => {
      const field = segmentoY01.beneficiario_final_bairro
      
      expect(field.pos).toEqual([116, 130])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
    })

    test('deve ter CEP do beneficiário final na posição 131-138', () => {
      expect(segmentoY01.beneficiario_final_cep.pos).toEqual([131, 135])
      expect(segmentoY01.beneficiario_final_cep.size).toBe(5)
      expect(segmentoY01.beneficiario_final_cep_sufixo.pos).toEqual([136, 138])
      expect(segmentoY01.beneficiario_final_cep_sufixo.size).toBe(3)
    })

    test('deve ter cidade do beneficiário final na posição 139-153', () => {
      const field = segmentoY01.beneficiario_final_cidade
      
      expect(field.pos).toEqual([139, 153])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
    })

    test('deve ter UF do beneficiário final na posição 154-155', () => {
      const field = segmentoY01.beneficiario_final_uf
      
      expect(field.pos).toEqual([154, 155])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(2)
    })

    test('deve ter 18 campos definidos no total', () => {
      const campos = Object.keys(segmentoY01)
      expect(campos.length).toBe(18)
    })
  })

  describe('Parsing de linha sintética', () => {
    test('deve extrair dados do beneficiário final corretamente', () => {
      // Linha sintética com Beneficiário Final completo
      const linha = '237' + // banco (pos 1-3)
                    '0001' + // lote (pos 4-7)
                    '3' + // tipo registro (pos 8)
                    '00001' + // número registro (pos 9-13)
                    'Y' + // segmento (pos 14)
                    ' ' + // cnab (pos 15)
                    '01' + // código movimento (pos 16-17)
                    '01' + // código registro opcional (pos 18-19)
                    '1' + // tipo inscrição (pos 20)
                    '012345678900000' + // número inscrição (pos 21-35)
                    'JOAO DA SILVA                           ' + // nome (pos 36-75) - 40 chars
                    'RUA DAS FLORES, 123                     ' + // endereço (pos 76-115) - 40 chars
                    'CENTRO         ' + // bairro (pos 116-130) - 15 chars
                    '01310' + // CEP (pos 131-135)
                    '100' + // CEP sufixo (pos 136-138)
                    'SAO PAULO      ' + // cidade (pos 139-153) - 15 chars
                    'SP' + // UF (pos 154-155)
                    ''.padEnd(85, ' ') // resto até 240

      const segY01 = extractLineFields(linha, segmentoY01)

      expect(segY01.controle_banco.value).toBe(237)
      expect(segY01.servico_segmento.value).toBe('Y')
      expect(segY01.codigo_registro_opcional.value).toBe(1)
      expect(segY01.beneficiario_final_inscricao_tipo.value).toBe(1)
      expect(segY01.beneficiario_final_inscricao_numero.value).toBe(12345678900000)
      expect(segY01.beneficiario_final_nome.value).toContain('JOAO DA SILVA')
      expect(segY01.beneficiario_final_endereco.value).toContain('RUA DAS FLORES')
      expect(segY01.beneficiario_final_bairro.value).toContain('CENTRO')
      expect(segY01.beneficiario_final_cep.value).toBe(1310)
      expect(segY01.beneficiario_final_cep_sufixo.value).toBe(100)
      expect(segY01.beneficiario_final_cidade.value).toContain('SAO PAULO')
      expect(segY01.beneficiario_final_uf.value).toBe('SP')
      
      expect(segY01.controle_banco.error).toBeFalsy()
      expect(segY01.beneficiario_final_nome.error).toBeFalsy()
    })

    test('deve extrair CPF do beneficiário final', () => {
      const linha = '237'.padEnd(19, '0') + 
                    '1' + // tipo inscrição (pos 20) = CPF
                    '012345678901000' + // CPF (pos 21-35)
                    ''.padEnd(205, ' ') // resto até 240

      const segY01 = extractLineFields(linha, segmentoY01)

      expect(segY01.beneficiario_final_inscricao_tipo.value).toBe(1)
      expect(segY01.beneficiario_final_inscricao_numero.value).toBe(12345678901000)
      expect(segY01.beneficiario_final_inscricao_tipo.error).toBeFalsy()
    })

    test('deve extrair CNPJ do beneficiário final', () => {
      const linha = '237'.padEnd(19, '0') + 
                    '2' + // tipo inscrição (pos 20) = CNPJ
                    '012345678901234' + // CNPJ (pos 21-35)
                    ''.padEnd(205, ' ') // resto até 240

      const segY01 = extractLineFields(linha, segmentoY01)

      expect(segY01.beneficiario_final_inscricao_tipo.value).toBe(2)
      expect(segY01.beneficiario_final_inscricao_numero.value).toBe(12345678901234)
      expect(segY01.beneficiario_final_inscricao_tipo.error).toBeFalsy()
    })

    test('deve extrair endereço completo com caracteres especiais', () => {
      const linha = '237'.padEnd(75, '0') + 
                    'AV. PAULISTA, 1578 - CONJ. 204          ' + // endereço (pos 76-115)
                    'BELA VISTA     ' + // bairro (pos 116-130)
                    ''.padEnd(110, ' ') // resto até 240

      const segY01 = extractLineFields(linha, segmentoY01)

      expect(segY01.beneficiario_final_endereco.value).toContain('AV. PAULISTA')
      expect(segY01.beneficiario_final_bairro.value).toContain('BELA VISTA')
      expect(segY01.beneficiario_final_endereco.error).toBeFalsy()
    })

    test('deve extrair CEP com zeros à esquerda', () => {
      const linha = '237'.padEnd(130, '0') + 
                    '00123' + // CEP (pos 131-135)
                    '456' + // CEP sufixo (pos 136-138)
                    ''.padEnd(102, ' ') // resto até 240

      const segY01 = extractLineFields(linha, segmentoY01)

      expect(segY01.beneficiario_final_cep.value).toBe(123)
      expect(segY01.beneficiario_final_cep_sufixo.value).toBe(456)
      expect(segY01.beneficiario_final_cep.error).toBeFalsy()
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      Object.keys(segmentoY01).forEach(fieldName => {
        const field = segmentoY01[fieldName]
        
        expect(field.pos).toBeDefined()
        expect(field.pos.length).toBe(2)
        expect(field.type).toBeDefined()
        expect(field.size).toBeDefined()
        expect(field.size).toBeGreaterThan(0)
      })
    })

    test('tamanhos declarados devem bater com as posições', () => {
      Object.keys(segmentoY01).forEach(fieldName => {
        const field = segmentoY01[fieldName]
        const [inicio, fim] = field.pos
        const tamanhoCalculado = fim - inicio + 1
        
        expect(tamanhoCalculado).toBe(field.size)
      })
    })

    test('não deve haver sobreposição de posições', () => {
      const fieldNames = Object.keys(segmentoY01)
      
      for (let i = 0; i < fieldNames.length; i++) {
        const field1 = segmentoY01[fieldNames[i]]
        const [start1, end1] = field1.pos
        
        for (let j = i + 1; j < fieldNames.length; j++) {
          const field2 = segmentoY01[fieldNames[j]]
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
      const positions = new Array(240).fill(false)
      
      Object.keys(segmentoY01).forEach(fieldName => {
        const field = segmentoY01[fieldName]
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

