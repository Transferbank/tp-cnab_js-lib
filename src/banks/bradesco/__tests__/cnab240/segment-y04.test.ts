/**
 * Testes do Segmento Y-04 - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Segmento Y-04 (Informações de Contato e PIX).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Tamanhos e decimais
 * 
 * NÃO testam regras de negócio (e-mail válido, chave PIX existente, etc.)
 * 
 * NOTA: Este é o segmento mais recente do manual Bradesco CNAB 240 (versão 04, dez/2024).
 * Inclui campos de PIX (tipo de chave, chave/URL QR Code, TXID) que não existem em
 * versões antigas do manual nem no pycnab240 vendorizado.
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'

// Buscar segmento Y04 de optionalRecords
const segmentoY04 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y04')?.schema
if (!segmentoY04) {
  throw new Error('Segmento Y04 não encontrado em optionalRecords')
}

describe('Schema Bradesco CNAB 240 - Segmento Y-04', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = segmentoY04.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      const field = segmentoY04.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('3')
    })

    test('deve ter identificador do segmento "Y" na posição 14', () => {
      const field = segmentoY04.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('Y')
    })

    test('deve ter código de registro opcional "03" na posição 18-19', () => {
      const field = segmentoY04.codigo_registro_opcional
      
      expect(field.pos).toEqual([18, 19])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('03')
    })

    test('deve ter e-mail do destinatário na posição 20-69', () => {
      const field = segmentoY04.destinatario_email
      
      expect(field.pos).toEqual([20, 69])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(50)
    })

    test('deve ter DDD do celular na posição 70-71', () => {
      const field = segmentoY04.destinatario_celular_ddd
      
      expect(field.pos).toEqual([70, 71])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
    })

    test('deve ter número do celular na posição 72-80', () => {
      const field = segmentoY04.destinatario_celular_numero
      
      expect(field.pos).toEqual([72, 80])
      expect(field.type).toBe('num')
      expect(field.size).toBe(9)
    })

    test('deve ter tipo de chave PIX na posição 81', () => {
      const field = segmentoY04.pix_tipo_chave
      
      expect(field.pos).toEqual([81, 81])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
    })

    test('deve ter chave PIX ou URL do QR Code na posição 82-158', () => {
      const field = segmentoY04.pix_chave_ou_url
      
      expect(field.pos).toEqual([82, 158])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(77)
    })

    test('deve ter TXID do PIX na posição 159-193', () => {
      const field = segmentoY04.pix_txid
      
      expect(field.pos).toEqual([159, 193])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(35)
    })

    test('deve ter 15 campos definidos no total', () => {
      const campos = Object.keys(segmentoY04)
      expect(campos.length).toBe(15)
    })
  })

  describe('Parsing de linha sintética', () => {
    test('deve extrair dados de contato corretamente', () => {
      // Linha sintética com contato e PIX
      const linha = '237' + // banco (pos 1-3)
                    '0001' + // lote (pos 4-7)
                    '3' + // tipo registro (pos 8)
                    '00001' + // número registro (pos 9-13)
                    'Y' + // segmento (pos 14)
                    ' ' + // cnab (pos 15)
                    '01' + // código movimento (pos 16-17)
                    '03' + // código registro opcional (pos 18-19)
                    'cliente@exemplo.com.br'.padEnd(50, ' ') + // e-mail (pos 20-69)
                    '11' + // DDD (pos 70-71)
                    '987654321' + // celular (pos 72-80)
                    '1' + // tipo chave PIX (pos 81)
                    '12345678901'.padEnd(77, ' ') + // chave PIX (pos 82-158)
                    'TXID123456789012345678901234567890'.padEnd(35, ' ') + // TXID (pos 159-193)
                    ''.padEnd(47, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.controle_banco.value).toBe(237)
      expect(segY04.servico_segmento.value).toBe('Y')
      expect(segY04.codigo_registro_opcional.value).toBe(3)
      expect(segY04.destinatario_email.value).toContain('cliente@exemplo.com.br')
      expect(segY04.destinatario_celular_ddd.value).toBe(11)
      expect(segY04.destinatario_celular_numero.value).toBe(987654321)
      expect(segY04.pix_tipo_chave.value).toBe(1)
      expect(segY04.pix_chave_ou_url.value).toContain('12345678901')
      expect(segY04.pix_txid.value).toContain('TXID123456789012345678901234567890')
      
      expect(segY04.controle_banco.error).toBeFalsy()
      expect(segY04.destinatario_email.error).toBeFalsy()
    })

    test('deve extrair e-mail longo', () => {
      const linha = '237'.padEnd(19, '0') + 
                    'nome.completo.muito.longo@empresa.exemplo.com.br'.padEnd(50, ' ') + // e-mail (pos 20-69)
                    ''.padEnd(171, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.destinatario_email.value).toContain('nome.completo.muito.longo')
      expect(segY04.destinatario_email.value).toContain('@empresa.exemplo.com.br')
      expect(segY04.destinatario_email.error).toBeFalsy()
    })

    test('deve extrair celular com 9 dígitos', () => {
      const linha = '237'.padEnd(69, '0') + 
                    '21' + // DDD Rio de Janeiro (pos 70-71)
                    '998765432' + // celular com 9 dígitos (pos 72-80)
                    ''.padEnd(160, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.destinatario_celular_ddd.value).toBe(21)
      expect(segY04.destinatario_celular_numero.value).toBe(998765432)
      expect(segY04.destinatario_celular_ddd.error).toBeFalsy()
    })

    test('deve extrair chave PIX do tipo CPF', () => {
      const linha = '237'.padEnd(80, '0') + 
                    '1' + // tipo chave PIX = CPF (pos 81)
                    '12345678901'.padEnd(77, ' ') + // CPF (pos 82-158)
                    ''.padEnd(82, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.pix_tipo_chave.value).toBe(1)
      expect(segY04.pix_chave_ou_url.value).toContain('12345678901')
      expect(segY04.pix_tipo_chave.error).toBeFalsy()
    })

    test('deve extrair chave PIX do tipo e-mail', () => {
      const linha = '237'.padEnd(80, '0') + 
                    '2' + // tipo chave PIX = e-mail (pos 81)
                    'chavepix@exemplo.com'.padEnd(77, ' ') + // e-mail (pos 82-158)
                    ''.padEnd(82, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.pix_tipo_chave.value).toBe(2)
      expect(segY04.pix_chave_ou_url.value).toContain('chavepix@exemplo.com')
      expect(segY04.pix_tipo_chave.error).toBeFalsy()
    })

    test('deve extrair chave PIX do tipo celular', () => {
      const linha = '237'.padEnd(80, '0') + 
                    '3' + // tipo chave PIX = celular (pos 81)
                    '+5511987654321'.padEnd(77, ' ') + // celular (pos 82-158)
                    ''.padEnd(82, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.pix_tipo_chave.value).toBe(3)
      expect(segY04.pix_chave_ou_url.value).toContain('+5511987654321')
      expect(segY04.pix_tipo_chave.error).toBeFalsy()
    })

    test('deve extrair chave PIX aleatória', () => {
      const linha = '237'.padEnd(80, '0') + 
                    '4' + // tipo chave PIX = aleatória (pos 81)
                    '123e4567-e89b-12d3-a456-426614174000'.padEnd(77, ' ') + // chave aleatória (pos 82-158)
                    ''.padEnd(82, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.pix_tipo_chave.value).toBe(4)
      expect(segY04.pix_chave_ou_url.value).toContain('123e4567-e89b-12d3-a456-426614174000')
      expect(segY04.pix_tipo_chave.error).toBeFalsy()
    })

    test('deve extrair URL do QR Code PIX', () => {
      const linha = '237'.padEnd(80, '0') + 
                    '5' + // tipo chave PIX = URL QR Code (pos 81)
                    'https://qrcode.pix.exemplo.com.br/v1/abc123'.padEnd(77, ' ') + // URL (pos 82-158)
                    ''.padEnd(82, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.pix_tipo_chave.value).toBe(5)
      expect(segY04.pix_chave_ou_url.value).toContain('https://qrcode.pix')
      expect(segY04.pix_tipo_chave.error).toBeFalsy()
    })

    test('deve extrair TXID do PIX', () => {
      const linha = '237'.padEnd(158, '0') + 
                    'ABC123XYZ456DEF789GHI012JKL345MNO' + // TXID (pos 159-193)
                    ''.padEnd(47, ' ') // resto até 240

      const segY04 = extractLineFields(linha, segmentoY04)

      expect(segY04.pix_txid.value).toContain('ABC123XYZ456DEF789GHI012JKL345MNO')
      expect(segY04.pix_txid.error).toBeFalsy()
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      Object.keys(segmentoY04).forEach(fieldName => {
        const field = segmentoY04[fieldName]
        
        expect(field.pos).toBeDefined()
        expect(field.pos.length).toBe(2)
        expect(field.type).toBeDefined()
        expect(field.size).toBeDefined()
        expect(field.size).toBeGreaterThan(0)
      })
    })

    test('tamanhos declarados devem bater com as posições', () => {
      Object.keys(segmentoY04).forEach(fieldName => {
        const field = segmentoY04[fieldName]
        const [inicio, fim] = field.pos
        const tamanhoCalculado = fim - inicio + 1
        
        expect(tamanhoCalculado).toBe(field.size)
      })
    })

    test('não deve haver sobreposição de posições', () => {
      const fieldNames = Object.keys(segmentoY04)
      
      for (let i = 0; i < fieldNames.length; i++) {
        const field1 = segmentoY04[fieldNames[i]]
        const [start1, end1] = field1.pos
        
        for (let j = i + 1; j < fieldNames.length; j++) {
          const field2 = segmentoY04[fieldNames[j]]
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
      
      Object.keys(segmentoY04).forEach(fieldName => {
        const field = segmentoY04[fieldName]
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
