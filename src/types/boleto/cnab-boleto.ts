import { CnabField } from '@/types/fields/cnab-field'
import { BoletoCnabData, CnabFieldValue } from '@/types/read/boleto-cnab-data'
import { CNABBoletoValidationError, CNABFieldNotFoundError } from '@/types/errors/field-errors'
import { ReadMode } from '@/types/core/read-mode'

export type BoletoFieldName =
  | 'nossoNumero'
  | 'numeroDocumento'
  | 'vencimento'
  | 'valor'
  | 'dataEmissao'
  | 'descontoValor'
  | 'abatimentoValor'
  | 'sacadoDocumento'
  | 'sacadoNome'
  | 'sacadoLogradouro'
  | 'sacadoCep'

export abstract class CnabBoleto<T extends BoletoCnabData = BoletoCnabData> {
  private readonly rawContent: string[]
  
  protected abstract get lineLength(): number
  
  protected abstract readonly nossoNumeroField: CnabField<string>
  protected abstract readonly numeroDocumentoField: CnabField<string>
  protected abstract readonly vencimentoField: CnabField<Date>
  protected abstract readonly valorField: CnabField<number>
  protected abstract readonly dataEmissaoField: CnabField<Date>
  protected abstract readonly descontoValorField: CnabField<number>
  protected abstract readonly abatimentoValorField: CnabField<number>
  protected abstract readonly sacadoDocumentoField: CnabField<string>
  protected abstract readonly sacadoNomeField: CnabField<string>
  protected abstract readonly sacadoLogradouroField: CnabField<string>
  protected abstract readonly sacadoCepField: CnabField<string>

  protected readonly extraFields: CnabField<CnabFieldValue>[] = []

  constructor(rawContent: string[]) {
    this.validateStructure(rawContent)
    this.rawContent = rawContent
  }

  protected validateStructure(rawContent: string[]): void {
    if (rawContent.length === 0) {
      this.throwStructureError('boleto deve conter pelo menos uma linha', 0)
    }

    for (let i = 0; i < rawContent.length; i++) {
      const line = rawContent[i]
      
      if (line == null) {
        this.throwStructureError(`linha ${i} não encontrada`, i)
      }
      
      if (line.length !== this.lineLength) {
        this.throwStructureError(`linha deve ter ${this.lineLength} caracteres, tem ${line.length}`, i)
      }
    }
  }

  protected throwStructureError(reason: string, lineNumber?: number): never {
    throw new CNABBoletoValidationError(reason, lineNumber)
  }

  readSimple(): T {
    const data: BoletoCnabData = {
      nossoNumero: this.nossoNumeroField.read(this.rawContent),
      numeroDocumento: this.numeroDocumentoField.read(this.rawContent),
      vencimento: this.vencimentoField.read(this.rawContent),
      valor: this.valorField.read(this.rawContent),
      dataEmissao: this.dataEmissaoField.read(this.rawContent),
      desconto: {
        valor: this.descontoValorField.read(this.rawContent),
      },
      abatimento: {
        valor: this.abatimentoValorField.read(this.rawContent),
      },
      sacado: {
        documento: this.sacadoDocumentoField.read(this.rawContent),
        nome: this.sacadoNomeField.read(this.rawContent),
        endereco: {
          logradouro: this.sacadoLogradouroField.read(this.rawContent),
          cep: this.sacadoCepField.read(this.rawContent),
        },
      },
    }

    return data as T
  }

  readFull(): T {
    const data = this.readSimple() as BoletoCnabData

    if (this.extraFields.length > 0) {
      data.extra = {}
      for (const field of this.extraFields) {
        data.extra[field.fieldKey] = field.read(this.rawContent)
      }
    }

    return data as T
  }

  readField(fieldName: BoletoFieldName): CnabFieldValue {
    const fieldMap: Record<BoletoFieldName, CnabField<CnabFieldValue>> = {
      nossoNumero: this.nossoNumeroField,
      numeroDocumento: this.numeroDocumentoField,
      vencimento: this.vencimentoField,
      valor: this.valorField,
      dataEmissao: this.dataEmissaoField,
      descontoValor: this.descontoValorField,
      abatimentoValor: this.abatimentoValorField,
      sacadoDocumento: this.sacadoDocumentoField,
      sacadoNome: this.sacadoNomeField,
      sacadoLogradouro: this.sacadoLogradouroField,
      sacadoCep: this.sacadoCepField,
    }

    const field = fieldMap[fieldName]
    if (field == null) {
      throw new CNABFieldNotFoundError(fieldName, false)
    }

    return field.read(this.rawContent)
  }

  readExtraField(fieldKey: string): CnabFieldValue {
    const extraField = this.extraFields.find(field => field.fieldKey === fieldKey)
    
    if (extraField == null) {
      throw new CNABFieldNotFoundError(fieldKey, true)
    }

    return extraField.read(this.rawContent)
  }

  read(mode: ReadMode = ReadMode.SIMPLE): T {
    if (mode === ReadMode.SIMPLE) {
      return this.readSimple()
    }
    return this.readFull()
  }
}
