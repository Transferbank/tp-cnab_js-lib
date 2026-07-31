/**
 * Testes do Trailer - Sicoob CNAB 400
 *
 * Valida a estrutura e campos do Trailer de Arquivo (tipo registro 9).
 *
 * PARTICULARIDADE ESTRUTURAL DO SICOOB (achado exclusivo):
 * Diferente de todos os outros bancos do projeto, o Sicoob embute 5 blocos de mensagem
 * de 40 caracteres cada DIRETAMENTE NO TRAILER (posições 195-394), em vez de usar
 * registros opcionais separados (tipo 2/5/etc.).
 *
 * Essas mensagens só são preenchidas quando instrucao_1=01 E instrucao_2=01 no detalhe
 * (ambos simultaneamente) — caso contrário, ficam em branco.
 *
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Valores padrão
 * - Campos obrigatórios
 *
 * Posições validadas conforme planilha oficial Sicoob (Layout_Cobranca_CNAB400 (1).xls, mai/2025).
 */

import { sicoobCnab400 } from '@banks/sicoob/schemas/cnab400'

describe('Schema Sicoob CNAB 400 - Trailer', () => {
  describe('Definição dos campos', () => {
    test('deve ter tipo_registro "9" (trailer) na posição 1', () => {
      const field = sicoobCnab400.trailer!.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('9')
      expect(field.required).toBe(true)
    })

    test('deve ter brancos na posição 2-194', () => {
      const field = sicoobCnab400.trailer!.brancos

      expect(field.pos).toEqual([2, 194])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(193)
      expect(field.required).toBe(false)
    })

    test('deve ter mensagem_responsabilidade_1 na posição 195-234', () => {
      const field = sicoobCnab400.trailer!.mensagem_responsabilidade_1

      expect(field.pos).toEqual([195, 234])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter mensagem_responsabilidade_2 na posição 235-274', () => {
      const field = sicoobCnab400.trailer!.mensagem_responsabilidade_2

      expect(field.pos).toEqual([235, 274])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter mensagem_responsabilidade_3 na posição 275-314', () => {
      const field = sicoobCnab400.trailer!.mensagem_responsabilidade_3

      expect(field.pos).toEqual([275, 314])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter mensagem_responsabilidade_4 na posição 315-354', () => {
      const field = sicoobCnab400.trailer!.mensagem_responsabilidade_4

      expect(field.pos).toEqual([315, 354])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter mensagem_responsabilidade_5 na posição 355-394', () => {
      const field = sicoobCnab400.trailer!.mensagem_responsabilidade_5

      expect(field.pos).toEqual([355, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter numero_sequencial na posição 395-400', () => {
      const field = sicoobCnab400.trailer!.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })

  describe('Particularidades estruturais do Sicoob', () => {
    const trailer = sicoobCnab400.trailer!

    test('deve ter 8 campos no total', () => {
      const campos = Object.keys(trailer)
      expect(campos.length).toBe(8)
    })

    test('todos os 5 blocos de mensagem devem ter 40 caracteres', () => {
      expect(trailer.mensagem_responsabilidade_1.size).toBe(40)
      expect(trailer.mensagem_responsabilidade_2.size).toBe(40)
      expect(trailer.mensagem_responsabilidade_3.size).toBe(40)
      expect(trailer.mensagem_responsabilidade_4.size).toBe(40)
      expect(trailer.mensagem_responsabilidade_5.size).toBe(40)
    })

    test('mensagens devem ocupar posições 195-394 (200 caracteres = 5 blocos * 40)', () => {
      expect(trailer.mensagem_responsabilidade_1.pos[0]).toBe(195)
      expect(trailer.mensagem_responsabilidade_5.pos[1]).toBe(394)

      const tamanhoTotal =
        trailer.mensagem_responsabilidade_1.size +
        trailer.mensagem_responsabilidade_2.size +
        trailer.mensagem_responsabilidade_3.size +
        trailer.mensagem_responsabilidade_4.size +
        trailer.mensagem_responsabilidade_5.size

      expect(tamanhoTotal).toBe(200)
    })

    test('mensagens devem ser sequenciais sem lacunas', () => {
      expect(trailer.mensagem_responsabilidade_1.pos[1] + 1).toBe(
        trailer.mensagem_responsabilidade_2.pos[0],
      )
      expect(trailer.mensagem_responsabilidade_2.pos[1] + 1).toBe(
        trailer.mensagem_responsabilidade_3.pos[0],
      )
      expect(trailer.mensagem_responsabilidade_3.pos[1] + 1).toBe(
        trailer.mensagem_responsabilidade_4.pos[0],
      )
      expect(trailer.mensagem_responsabilidade_4.pos[1] + 1).toBe(
        trailer.mensagem_responsabilidade_5.pos[0],
      )
    })

    test('descrições das mensagens devem mencionar condicionalidade (instrucao_1=01 E instrucao_2=01)', () => {
      expect(trailer.mensagem_responsabilidade_1.description).toContain('instrucao_1=01')
      expect(trailer.mensagem_responsabilidade_1.description).toContain('instrucao_2=01')
      expect(trailer.mensagem_responsabilidade_2.description).toContain('instrucao_1=01')
      expect(trailer.mensagem_responsabilidade_2.description).toContain('instrucao_2=01')
      expect(trailer.mensagem_responsabilidade_3.description).toContain('instrucao_1=01')
      expect(trailer.mensagem_responsabilidade_3.description).toContain('instrucao_2=01')
      expect(trailer.mensagem_responsabilidade_4.description).toContain('instrucao_1=01')
      expect(trailer.mensagem_responsabilidade_4.description).toContain('instrucao_2=01')
      expect(trailer.mensagem_responsabilidade_5.description).toContain('instrucao_1=01')
      expect(trailer.mensagem_responsabilidade_5.description).toContain('instrucao_2=01')
    })

    test('não deve ter campos de totalização (diferente de outros bancos)', () => {
      const campos = Object.keys(trailer)
      expect(campos).not.toContain('qtd_documentos')
      expect(campos).not.toContain('valor_total')
      expect(campos).not.toContain('quantidade_titulos')
      expect(campos).not.toContain('valor_total_titulos')
    })

    test('campo brancos deve ser o maior campo antes das mensagens', () => {
      expect(trailer.brancos.size).toBe(193)
      expect(trailer.brancos.pos).toEqual([2, 194])
    })
  })
})

