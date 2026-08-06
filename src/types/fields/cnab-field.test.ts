import { CnabField } from '@/types/fields/cnab-field'
import { CNABFieldValidationError } from '@/types/errors/field-errors'
import { NumericValidator, StringValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

class TestNumericField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [0, 5]
  protected readonly description = 'campo numérico'
  protected readonly validator = new NumericValidator()
  protected readonly parser = new TrimParser()
}

class TestStringField extends CnabField<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [0, 10]
  protected readonly description = 'campo texto'
  protected readonly validator = new StringValidator()
  protected readonly parser = new TrimParser()
}

describe('CnabField', () => {
  describe('validate com NumericValidator', () => {
    test('sucesso: string numérica', () => {
      const field = new TestNumericField()
      const lines = ['12345' + 'X'.repeat(395)]

      expect(() => field.read(lines)).not.toThrow()
    })

    test('falha: contém letras', () => {
      const field = new TestNumericField()
      const lines = ['ABC45' + 'X'.repeat(395)]

      expect(() => field.read(lines)).toThrow(CNABFieldValidationError)
      expect(() => field.read(lines)).toThrow('deve conter apenas dígitos')
    })

    test('falha: campo vazio', () => {
      const field = new TestNumericField()
      const lines = ['     ' + 'X'.repeat(395)]

      expect(() => field.read(lines)).toThrow(CNABFieldValidationError)
    })
  })

  describe('validate com StringValidator', () => {
    test('sucesso: string não vazia', () => {
      const field = new TestStringField()
      const lines = ['TEXTO123  ' + 'X'.repeat(390)]

      expect(() => field.read(lines)).not.toThrow()
    })

    test('falha: string vazia após trim', () => {
      const field = new TestStringField()
      const lines = ['          ' + 'X'.repeat(390)]

      expect(() => field.read(lines)).toThrow(CNABFieldValidationError)
      expect(() => field.read(lines)).toThrow('campo não pode estar vazio')
    })
  })

  describe('read', () => {
    test('retorna valor correto após parse', () => {
      const field = new TestStringField()
      const lines = ['  VALOR  ' + ' ' + 'X'.repeat(390)]

      const result = field.read(lines)

      expect(result).toBe('VALOR')
    })

    test('extrai da posição correta', () => {
      const field = new TestNumericField()
      const lines = ['12345' + 'X'.repeat(395)]

      const result = field.read(lines)

      expect(result).toBe('12345')
    })

    test('lança erro quando linha não existe', () => {
      const field = new TestNumericField()
      const lines: string[] = []

      expect(() => field.read(lines)).toThrow(CNABFieldValidationError)
      expect(() => field.read(lines)).toThrow('linha 0 não encontrada no array fornecido')
    })

    test('lança erro quando array é menor que lineIndex', () => {
      class FieldOnLine2 extends CnabField<string> {
        protected readonly lineIndex = 2
        protected readonly pos: [number, number] = [0, 5]
        protected readonly description = 'campo na linha 2'
        protected readonly validator = new NumericValidator()
        protected readonly parser = new TrimParser()
      }

      const field = new FieldOnLine2()
      const lines = ['linha0', 'linha1']

      expect(() => field.read(lines)).toThrow(CNABFieldValidationError)
      expect(() => field.read(lines)).toThrow('linha 2 não encontrada no array fornecido')
    })
  })
})
