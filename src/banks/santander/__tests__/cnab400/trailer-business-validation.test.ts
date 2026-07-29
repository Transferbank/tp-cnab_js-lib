/**
 * Testes de validação CNAB 400 — Santander (033)
 * 
 * Testa a validação completa de arquivos CNAB 400 do Santander incluindo:
 * - Checagem cruzada de quantidade de documentos no trailer
 * - Validação de múltiplos detalhes
 */

import { openCnab } from '../../../../index'
import { santanderCnab400 } from '../../schemas/cnab400'
import { buildLine400 } from '../../../../__tests__/helpers/cnab-builder'

describe('openCnab + CNABFile.validate() — Santander (033) CNAB 400', () => {
  describe('Checagem cruzada do trailer', () => {
    const header = buildLine400(santanderCnab400.header!, {
      codigo_transmissao: '01234567890123456789', // 20 chars (agência + código cliente + conta)
      nome_empresa: 'EMPRESA EXEMPLO',
      data_geracao: '010126',
      numero_sequencial: '1',
    })
    const detail = buildLine400(santanderCnab400.detail!, {
      codigo_transmissao: '01234567890123456789', // 20 chars
      sacado_codigo_inscricao: '01',
      sacado_numero_inscricao: '00011144477735',
      nome: 'JOAO DA SILVA',
      vencimento: '311299',
      valor_titulo: '0000000010000',
      numero_sequencial: '2',
    })

    test('deve acusar erro quando quantidade declarada no trailer diverge do total de detalhes', () => {
      const trailer = buildLine400(santanderCnab400.trailer!, {
        qtd_documentos: '2', // declara 2, mas só há 1 detalhe
        numero_sequencial: '3',
      })

      const cnabFile = openCnab([header, detail, trailer].join('\n'))
      const result = cnabFile.validate()

      expect(result.feedback.lines).toContainEqual(
        expect.objectContaining({ field: 'Quantidade no Trailer' }),
      )
    })

    test('não deve acusar erro quando a quantidade do trailer bate com o total de detalhes', () => {
      const trailer = buildLine400(santanderCnab400.trailer!, {
        qtd_documentos: '1',
        numero_sequencial: '3',
      })

      const cnabFile = openCnab([header, detail, trailer].join('\n'))
      const result = cnabFile.validate()

      expect(result.feedback.lines.filter((e) => e.field === 'Quantidade no Trailer')).toEqual([])
    })

    test('deve validar trailer com múltiplos detalhes', () => {
      const detail1 = buildLine400(santanderCnab400.detail!, {
        codigo_transmissao: '01234567890123456789', // 20 chars
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        data_emissao: '010126',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '2',
      })
      
      const detail2 = buildLine400(santanderCnab400.detail!, {
        codigo_transmissao: '01234567890123456789', // 20 chars
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00012345678909',
        nome: 'MARIA SANTOS',
        data_emissao: '010126',
        vencimento: '151299',
        valor_titulo: '0000000020000',
        numero_sequencial: '3',
      })

      const trailer = buildLine400(santanderCnab400.trailer!, {
        qtd_documentos: '2', // Correto: 2 detalhes
        numero_sequencial: '4',
      })

      const cnabFile = openCnab([header, detail1, detail2, trailer].join('\n'))
      const result = cnabFile.validate()

      expect(result.feedback.lines.filter((e) => e.field === 'Quantidade no Trailer')).toEqual([])
      expect(result.isValid).toBe(true)
    })
  })
})
