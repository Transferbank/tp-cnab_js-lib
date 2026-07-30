/**
 * Testes de validação de negócio CNAB 240 (genéricos)
 *
 * Testa a lógica de negócio do validador CNAB 240:
 * - Pareamento robusto de Segmentos P+Q
 * - Fallback para posições fixas FEBRABAN quando não há schema
 * - Validação de dados de negócio (valor, vencimento, documento, nome)
 *
 * Nota: Validações estruturais (tamanho de linha, tipo de registro, etc.)
 * são exclusivas do validador estrutural (cnab240-structure-validator.ts).
 */

import { validateCnab240Content } from '../cnab240-content-validator'
import { ValidationError } from '@tp-types/index'

describe('validateCnab240Content — Validação de Negócio', () => {
  describe('Validação sem schema (fallback de posições fixas FEBRABAN)', () => {
    test('deve extrair dados usando offsets FEBRABAN quando não há schema', () => {
      const header = ' '.repeat(7) + '0' + ' '.repeat(232)

      const segP = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' +
                   ' '.repeat(63) + '31122099' +
                   '000000000010000' +
                   ' '.repeat(140)

      const segQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' +
                   ' '.repeat(4) + '000012345678909' +
                   'JOAO DA SILVA                           ' +
                   'RUA EXEMPLO                             ' +
                   ' '.repeat(127)

      const trailer = ' '.repeat(7) + '9' + ' '.repeat(232)

      const result = validateCnab240Content([header, segP, segQ, trailer], null)

      expect(result.errors).toEqual([])
      expect(result.records[0]).toMatchObject({
        name: 'JOAO DA SILVA',
        amount: 100.00,
        document: '12345678909'
      })
    })
  })

  describe('Pareamento P/Q robusto', () => {
    test('deve gerar erro quando Segmento P vem corrompido (tipo de registro inválido) seguido de Q', () => {
      // Bug original: linha P ruim fazia continue antes de incrementar detailCount,
      // causando Q seguinte parear com P anterior (stale data).
      // Correção: pendingP é zerado quando a linha não tem tipo de registro '3' na posição 8,
      // então um Q sem P pendente gera erro explícito.
      //
      // Nota: o validador de negócio não checa o tamanho total da linha (isso é validação
      // estrutural) — uma linha P meramente truncada, mas com os campos necessários presentes
      // nas posições certas, ainda é lida com sucesso e mantém o pareamento. Para simular P
      // genuinamente inutilizável aqui, usamos uma linha cujo tipo de registro (posição 8) não
      // é '3', o que é o único gatilho que zera pendingP no loop principal.

      const header = ' '.repeat(7) + '0' + ' '.repeat(232)

      const segP1 = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' +
                    ' '.repeat(63) + '31122099' + '000000000050000' + ' '.repeat(140)

      const segQ1 = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' +
                    ' '.repeat(4) + '000011111111111' +
                    'TITULO 1 CORRETO                        ' +
                    'RUA A                                   ' +
                    ' '.repeat(127)

      // Linha corrompida no lugar do Segmento P do título 2 (tipo de registro 'X', não '3')
      const segP2Broken = ' '.repeat(7) + 'X' + ' '.repeat(232)

      const segQ2 = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' +
                    ' '.repeat(4) + '000022222222222' +
                    'TITULO 2 ORFAO                          ' +
                    'RUA B                                   ' +
                    ' '.repeat(127)

      const trailer = ' '.repeat(7) + '9' + ' '.repeat(232)

      const result = validateCnab240Content([header, segP1, segQ1, segP2Broken, segQ2, trailer], null)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 5,
          field: 'Segmento Q',
          message: 'Segmento Q sem Segmento P válido correspondente — valor/vencimento indisponíveis'
        })
      )

      expect(result.records).toHaveLength(2)

      expect(result.records[0]).toMatchObject({
        name: 'TITULO 1 CORRETO',
        amount: 500.00,
        dueDate: '31/12/2099'
      })

      // Título 2 tem fallback (amount: 0, dueDate: '—') por causa do P quebrado
      expect(result.records[1]).toMatchObject({
        name: 'TITULO 2 ORFAO',
        amount: 0,
        dueDate: '—'
      })
    })

    test('deve gerar erro quando Segmento Q aparece sem nenhum P antes', () => {
      const header = ' '.repeat(7) + '0' + ' '.repeat(232)
      const headerLote = ' '.repeat(7) + '1' + ' '.repeat(232)

      const segQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' +
                   ' '.repeat(4) + '000012345678909' +
                   'PAGADOR SEM TITULO                      ' +
                   'RUA VAZIA                               ' +
                   ' '.repeat(127)

      const trailer = ' '.repeat(7) + '9' + ' '.repeat(232)

      const result = validateCnab240Content([header, headerLote, segQ, trailer], null)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          field: 'Segmento Q',
          message: 'Segmento Q sem Segmento P válido correspondente — valor/vencimento indisponíveis'
        })
      )

      expect(result.records).toHaveLength(1)
      expect(result.records[0]).toMatchObject({
        amount: 0,
        dueDate: '—'
      })
    })

    test('caso feliz: P válido → Q válido continua funcionando', () => {
      const header = ' '.repeat(7) + '0' + ' '.repeat(232)

      const segP = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' +
                   ' '.repeat(63) + '15012025' + '000000000010000' + ' '.repeat(140)

      const segQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' +
                   ' '.repeat(4) + '000012345678909' +
                   'JOAO SILVA                              ' +
                   'RUA EXEMPLO                             ' +
                   ' '.repeat(127)

      const trailer = ' '.repeat(7) + '9' + ' '.repeat(232)

      const result = validateCnab240Content([header, segP, segQ, trailer], null)

      const pairingErrors = result.errors.filter((e: ValidationError) => e.field === 'Segmento Q')
      expect(pairingErrors).toHaveLength(0)

      expect(result.records).toHaveLength(1)
      expect(result.records[0]).toMatchObject({
        name: 'JOAO SILVA',
        amount: 100.00,
        dueDate: '15/01/2025',
        document: '12345678909'
      })
    })

    test('dois P seguidos sem Q entre eles, depois um Q: deve parear com o P mais recente', () => {
      const header = ' '.repeat(7) + '0' + ' '.repeat(232)

      // P do título 1 (será descartado - sem Q correspondente)
      const segP1 = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' +
                    ' '.repeat(63) + '31122099' + '000000000010000' + ' '.repeat(140)

      // P do título 2 (será pareado com o Q seguinte)
      const segP2 = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' +
                    ' '.repeat(63) + '15012025' + '000000000020000' + ' '.repeat(140)

      // Q único - deve parear com P2 (mais recente), não com P1
      const segQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' +
                   ' '.repeat(4) + '000012345678909' +
                   'SEGUNDO TITULO                          ' +
                   'RUA EXEMPLO                             ' +
                   ' '.repeat(127)

      const trailer = ' '.repeat(7) + '9' + ' '.repeat(232)

      const result = validateCnab240Content([header, segP1, segP2, segQ, trailer], null)

      // Deve ter 1 registro (apenas o par P2+Q)
      expect(result.records).toHaveLength(1)

      // Registro deve ter dados do P2 (mais recente), não do P1
      expect(result.records[0]).toMatchObject({
        name: 'SEGUNDO TITULO',
        amount: 200.00,  // Do P2, não do P1 (100.00)
        dueDate: '15/01/2025'  // Do P2, não do P1 (31/12/2099)
      })
    })

    test('segmento opcional entre P e Q invalida o pareamento', () => {
      // Pela spec FEBRABAN, segmentos opcionais (R/S/Y) só vêm DEPOIS de um par P+Q completo,
      // nunca entre eles. Se aparecer algo que não seja Q após um P, o pareamento é quebrado.

      const header = ' '.repeat(7) + '0' + ' '.repeat(232)

      const segP = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' +
                   ' '.repeat(63) + '31122099' + '000000000050000' + ' '.repeat(140)

      // Segmento R entre P e Q (estrutura inválida pela spec)
      const segR = ' '.repeat(7) + '3' + ' '.repeat(5) + 'R' + ' '.repeat(227)

      const segQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' +
                   ' '.repeat(4) + '000012345678909' +
                   'PAGADOR ORFAO                           ' +
                   'RUA EXEMPLO                             ' +
                   ' '.repeat(127)

      const trailer = ' '.repeat(7) + '9' + ' '.repeat(232)

      const result = validateCnab240Content([header, segP, segR, segQ, trailer], null)

      // Q sem P válido imediatamente antes deve gerar erro
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 4,
          field: 'Segmento Q',
          message: 'Segmento Q sem Segmento P válido correspondente — valor/vencimento indisponíveis'
        })
      )

      // Registro deve ter fallback (pendingP foi zerado pelo segR)
      expect(result.records[0]).toMatchObject({
        amount: 0,
        dueDate: '—'
      })
    })
  })
})
