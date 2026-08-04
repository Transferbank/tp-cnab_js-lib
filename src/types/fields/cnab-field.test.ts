import { CnabField400 } from './cnab-field-400'
import { CnabField240 } from './cnab-field-240'
import {
  CNABFieldValidationError,
  CNABBoletoValidationError,
} from '../errors/field-errors'

// Subclasses de teste mínimas para CnabField400
class TestField400 extends CnabField400<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [0, 10]
  protected readonly description = 'campo de teste 400'

  validate(raw: string): void {
    if (raw.trim() === 'INVALID') {
      this.throwError(raw, 'valor não permitido')
    }
  }

  parse(raw: string): string {
    return raw.trim()
  }
}

class TestField400ThrowsInValidate extends CnabField400<string> {
  protected readonly lineIndex = 0
  protected readonly pos: [number, number] = [0, 5]
  protected readonly description = 'campo que lança em validate'

  validate(_raw: string): void {
    throw new Error('validate foi chamado')
  }

  parse(_raw: string): string {
    throw new Error('parse NÃO deveria ser chamado')
  }
}

// Subclasses de teste mínimas para CnabField240
class TestField240 extends CnabField240<number> {
  protected readonly lineIndex = 1
  protected readonly pos: [number, number] = [4, 9]
  protected readonly description = 'campo de teste 240'

  validate(raw: string): void {
    if (!/^\d+$/.test(raw)) {
      this.throwError(raw, 'deve conter apenas dígitos')
    }
  }

  parse(raw: string): number {
    return parseInt(raw, 10)
  }
}

describe('CnabField (base abstrata)', () => {
  describe('read() - fluxo completo', () => {
    test('deve chamar validateStructure → extractRaw → validate → parse na ordem correta', () => {
      const field = new TestField400()
      const lines = ['ABCDEFGHIJ' + 'X'.repeat(390)]

      const result = field.read(lines)

      expect(result).toBe('ABCDEFGHIJ')
    })

    test('validateStructure que lança deve impedir extractRaw/validate/parse', () => {
      const field = new TestField400()
      const lines: string[] = [] // linha ausente

      expect(() => field.read(lines)).toThrow(CNABBoletoValidationError)
      expect(() => field.read(lines)).toThrow('linha 0 não encontrada')
    })

    test('validate() que lança deve impedir parse() de rodar', () => {
      const field = new TestField400ThrowsInValidate()
      const lines = ['ABCDE' + 'X'.repeat(395)]

      expect(() => field.read(lines)).toThrow('validate foi chamado')
    })
  })

  describe('extractRaw()', () => {
    test('deve extrair substring correta (pos 0-indexed)', () => {
      const field = new TestField400()
      const lines = ['0123456789' + 'X'.repeat(390)]

      const raw = field['extractRaw'](lines)

      expect(raw).toBe('0123456789')
    })

    test('deve respeitar pos [inicio, fim] com substring', () => {
      class TestFieldPartial extends CnabField400<string> {
        protected readonly lineIndex = 0
        protected readonly pos: [number, number] = [2, 7]
        protected readonly description = 'teste parcial'
        validate(): void {}
        parse(raw: string): string {
          return raw
        }
      }

      const field = new TestFieldPartial()
      const lines = ['0123456789' + 'X'.repeat(390)]

      const raw = field['extractRaw'](lines)

      expect(raw).toBe('23456')
    })
  })

  describe('throwError()', () => {
    test('deve lançar CNABFieldValidationError com campos corretos', () => {
      const field = new TestField400()
      const lines = ['INVALID' + ' '.repeat(3) + 'X'.repeat(390)]

      expect(() => field.read(lines)).toThrow(CNABFieldValidationError)

      try {
        field.read(lines)
      } catch (error) {
        const fieldError = error as CNABFieldValidationError
        expect(fieldError).toBeInstanceOf(CNABFieldValidationError)
        expect(fieldError.code).toBe('FIELD_VALIDATION_ERROR')
        expect(fieldError.field).toBe('campo de teste 400')
        expect(fieldError.rawValue).toBe('INVALID' + ' '.repeat(3))
        expect(fieldError.message).toContain('Campo "campo de teste 400" inválido')
        expect(fieldError.message).toContain('valor não permitido')
      }
    })
  })

  describe('throwStructureError()', () => {
    test('deve lançar CNABBoletoValidationError com lineNumber', () => {
      const field = new TestField400()
      const lines = ['CURTA'] // linha muito curta

      expect(() => field.read(lines)).toThrow(CNABBoletoValidationError)

      try {
        field.read(lines)
      } catch (error) {
        const boletoError = error as CNABBoletoValidationError
        expect(boletoError).toBeInstanceOf(CNABBoletoValidationError)
        expect(boletoError.code).toBe('BOLETO_VALIDATION_ERROR')
        expect(boletoError.lineNumber).toBe(0)
        expect(boletoError.message).toContain('linha 0')
        expect(boletoError.message).toContain('linha deve ter 400 caracteres')
      }
    })
  })
})

describe('CnabField400', () => {
  describe('validateStructure()', () => {
    test('deve aceitar linha de 400 caracteres', () => {
      const field = new TestField400()
      const lines = ['A'.repeat(400)]

      expect(() => field.read(lines)).not.toThrow()
    })

    test('deve rejeitar linha ausente', () => {
      const field = new TestField400()
      const lines: string[] = []

      expect(() => field.read(lines)).toThrow(CNABBoletoValidationError)
      expect(() => field.read(lines)).toThrow('linha 0 não encontrada')
    })

    test('deve rejeitar linha com 399 caracteres', () => {
      const field = new TestField400()
      const lines = ['A'.repeat(399)]

      expect(() => field.read(lines)).toThrow(CNABBoletoValidationError)
      expect(() => field.read(lines)).toThrow('linha deve ter 400 caracteres, tem 399')
    })

    test('deve rejeitar linha com 401 caracteres', () => {
      const field = new TestField400()
      const lines = ['A'.repeat(401)]

      expect(() => field.read(lines)).toThrow(CNABBoletoValidationError)
      expect(() => field.read(lines)).toThrow('linha deve ter 400 caracteres, tem 401')
    })
  })
})

describe('CnabField240', () => {
  describe('validateStructure()', () => {
    test('deve aceitar linha de 240 caracteres', () => {
      const field = new TestField240()
      const lines = [
        'A'.repeat(240), // linha 0
        'XXXX12345' + 'Y'.repeat(231), // linha 1: pos [4,9] = "12345"
      ]

      expect(() => field.read(lines)).not.toThrow()
    })

    test('deve rejeitar linha ausente', () => {
      const field = new TestField240()
      const lines = ['A'.repeat(240)] // só linha 0, falta linha 1

      expect(() => field.read(lines)).toThrow(CNABBoletoValidationError)
      expect(() => field.read(lines)).toThrow('linha 1 não encontrada')
    })

    test('deve rejeitar linha com 239 caracteres', () => {
      const field = new TestField240()
      const lines = [
        'A'.repeat(240),
        'B'.repeat(239), // linha 1 com tamanho errado
      ]

      expect(() => field.read(lines)).toThrow(CNABBoletoValidationError)
      expect(() => field.read(lines)).toThrow('linha deve ter 240 caracteres, tem 239')
    })

    test('deve rejeitar linha com 241 caracteres', () => {
      const field = new TestField240()
      const lines = [
        'A'.repeat(240),
        'B'.repeat(241), // linha 1 com tamanho errado
      ]

      expect(() => field.read(lines)).toThrow(CNABBoletoValidationError)
      expect(() => field.read(lines)).toThrow('linha deve ter 240 caracteres, tem 241')
    })
  })

  describe('validate() e parse() customizados', () => {
    test('deve executar validate() customizado', () => {
      const field = new TestField240()
      const lines = [
        'A'.repeat(240),
        'XXXX12345' + 'Y'.repeat(231), // pos [4,9] = "12345" (válido)
      ]

      expect(() => field.read(lines)).not.toThrow()
    })

    test('deve rejeitar quando validate() customizado lança', () => {
      const field = new TestField240()
      const lines = [
        'A'.repeat(240),
        'XXXXABC45' + 'Y'.repeat(231), // pos [4,9] = "ABC45" (contém letras)
      ]

      expect(() => field.read(lines)).toThrow(CNABFieldValidationError)
      expect(() => field.read(lines)).toThrow('deve conter apenas dígitos')
    })

    test('deve executar parse() e retornar tipo correto', () => {
      const field = new TestField240()
      const lines = [
        'A'.repeat(240),
        'XXXX00123' + 'Y'.repeat(231), // pos [4,9] = "00123"
      ]

      const result = field.read(lines)

      expect(result).toBe(123)
      expect(typeof result).toBe('number')
    })
  })
})
