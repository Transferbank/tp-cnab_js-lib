import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabInvalidRecordSequenceError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240RecordSequenceValidator } from '@cnab/validators/cnab240/cnab240-record-sequence-validator'

describe('Cnab240RecordSequenceValidator', (): void => {
  const isSegmento = (line: string, segment: string): boolean => line[7] == '3' && line[13] == segment
  const readItau = (): string[] => readExampleLines(path.join(resPath(), 'itau/cnab240/itau_cnab_240.txt'))

  it.each([
    ['banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt'],
    ['bradesco/cnab240/bradesco_cnab_240.txt'],
    ['caixa/cnab240/caixa_cnab_240.txt'],
    ['itau/cnab240/itau_cnab_240.txt'],
    ['santander/cnab240/santander_cnab_240.txt'],
    ['sicoob/cnab240/sicoob_cnab_240.txt'],
    ['sicredi/cnab240/sicredi_cnab_240.txt']
  ])('given valid document file %s when validating then accepts it', (examplePath: string): void => {
    // Given
    const rawLines = readExampleLines(path.join(resPath(), examplePath))

    // When
    const result = new Cnab240RecordSequenceValidator().validate(rawLines)

    // Then
    expect(result).toEqual(genValidCnabValidationResult())
  })

  it('given lote whose first record is not 00001 when validating then accepts it', (): void => {
    // Given
    const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt'))
    const firstRecord = rawLines.find((line: string) => line[7] == '3')

    // When
    const result = new Cnab240RecordSequenceValidator().validate(rawLines)

    // Then
    expect(firstRecord?.substring(8, 13)).not.toBe('00001')
    expect(result).toEqual(genValidCnabValidationResult())
  })

  it('given deleted record when validating then reports the gap at the next record', (): void => {
    // Given: P#00003 Q#00004 R#00005 do segundo boleto; apaga o Q
    const rawLines = readItau()
    const deletedLineNumber = rawLines.findIndex((line: string) => isSegmento(line, 'R')) - 1
    rawLines.splice(deletedLineNumber, 1)
    const nextRecordLineNumber = deletedLineNumber

    // When
    const result = new Cnab240RecordSequenceValidator().validate(rawLines)

    // Then
    expect(result.errors).toEqual([
      new CnabInvalidRecordSequenceError({ lineNumber: nextRecordLineNumber, expectedSequence: 4, actualSequence: '00005' })
    ])
    expect(result.errors[0].message).toBe('Número sequencial do registro no lote fora de ordem: esperado 00004, recebido 00005')
  })

  it('given duplicated record when validating then reports only the duplicate', (): void => {
    // Given
    const rawLines = readItau()
    const segmentoQLineNumber = rawLines.findIndex((line: string) => isSegmento(line, 'Q'))
    const duplicateLineNumber = segmentoQLineNumber + 1
    rawLines.splice(duplicateLineNumber, 0, rawLines[segmentoQLineNumber])

    // When
    const result = new Cnab240RecordSequenceValidator().validate(rawLines)

    // Then
    expect(result.errors).toEqual([
      new CnabInvalidRecordSequenceError({ lineNumber: duplicateLineNumber, expectedSequence: 3, actualSequence: '00002' })
    ])
  })

  it('given swapped records when validating then reports both records out of order', (): void => {
    // Given
    const rawLines = readItau()
    const segmentoRLineNumber = rawLines.findIndex((line: string) => isSegmento(line, 'R'))
    const segmentoQLineNumber = segmentoRLineNumber - 1
    const segmentoQ = rawLines[segmentoQLineNumber]
    rawLines[segmentoQLineNumber] = rawLines[segmentoRLineNumber]
    rawLines[segmentoRLineNumber] = segmentoQ

    // When
    const result = new Cnab240RecordSequenceValidator().validate(rawLines)

    // Then
    expect(result.errors).toEqual([
      new CnabInvalidRecordSequenceError({ lineNumber: segmentoQLineNumber, expectedSequence: 4, actualSequence: '00005' }),
      new CnabInvalidRecordSequenceError({ lineNumber: segmentoRLineNumber, expectedSequence: 6, actualSequence: '00004' })
    ])
  })

  it('given non numeric sequence when validating then reports it', (): void => {
    // Given
    const rawLines = readItau()
    const firstRecordLineNumber = rawLines.findIndex((line: string) => line[7] == '3')
    rawLines[firstRecordLineNumber] = replaceLineRange(rawLines[firstRecordLineNumber], [9, 13], 'ABCDE')

    // When
    const result = new Cnab240RecordSequenceValidator().validate(rawLines)

    // Then
    expect(result.errors).toEqual([
      new CnabInvalidRecordSequenceError({ lineNumber: firstRecordLineNumber, expectedSequence: null, actualSequence: 'ABCDE' })
    ])
    expect(result.errors[0].message).toBe('Número sequencial do registro no lote inválido: "ABCDE"')
  })
})
