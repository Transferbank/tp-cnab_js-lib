import { CnabField } from '@/types/fields/cnab-field'
import { CnabFieldValue, PartialBoletoCnabData } from '@/types/read/boleto-cnab-data'
import { CNABBoletoValidationError, CNABFieldNotFoundError, CNABFieldValidationError } from '@/types/errors/field-errors'
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

export interface BoletoReadResult {
  data: PartialBoletoCnabData
  errors: (CNABFieldValidationError | CNABBoletoValidationError)[]
}

export abstract class CnabBoleto {
  private readonly rawContent: string[]
  private readonly structuralError: CNABBoletoValidationError | null
  private _fieldMap?: Record<BoletoFieldName, CnabField<CnabFieldValue>>
  
  protected abstract get bankCode(): string
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

  protected abstract get extraFields(): CnabField<CnabFieldValue>[]

  constructor(rawContent: string[]) {
    this.rawContent = rawContent
    this.structuralError = this.captureStructuralError(rawContent)
  }

  private captureStructuralError(rawContent: string[]): CNABBoletoValidationError | null {
    try {
      this.validateStructure(rawContent)
      return null
    } catch (e) {
      if (e instanceof CNABBoletoValidationError) {
        return e
      }
      throw e
    }
  }

  private get fieldMap(): Record<BoletoFieldName, CnabField<CnabFieldValue>> {
    if (this._fieldMap == null) {
      this._fieldMap = {
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
    }
    return this._fieldMap
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

  private tryRead<V>(field: CnabField<V>, errors: (CNABFieldValidationError | CNABBoletoValidationError)[]): V | undefined {
    try {
      return field.read(this.rawContent)
    } catch (e) {
      if (e instanceof CNABFieldValidationError) {
        errors.push(e)
        return undefined
      }
      throw e
    }
  }

  readSimple(): BoletoReadResult {
    const errors: (CNABFieldValidationError | CNABBoletoValidationError)[] = []
    const data: PartialBoletoCnabData = {}
    
    if (this.structuralError != null) {
      errors.push(this.structuralError)
      return { data, errors }
    }

    data.nossoNumero = this.tryRead(this.nossoNumeroField, errors)
    data.numeroDocumento = this.tryRead(this.numeroDocumentoField, errors)
    data.vencimento = this.tryRead(this.vencimentoField, errors)
    data.valor = this.tryRead(this.valorField, errors)
    data.dataEmissao = this.tryRead(this.dataEmissaoField, errors)

    const descontoValor = this.tryRead(this.descontoValorField, errors)
    if (descontoValor != null) {
      data.desconto = { valor: descontoValor }
    }

    const abatimentoValor = this.tryRead(this.abatimentoValorField, errors)
    if (abatimentoValor != null) {
      data.abatimento = { valor: abatimentoValor }
    }

    const sacadoDocumento = this.tryRead(this.sacadoDocumentoField, errors)
    const sacadoNome = this.tryRead(this.sacadoNomeField, errors)
    const sacadoLogradouro = this.tryRead(this.sacadoLogradouroField, errors)
    const sacadoCep = this.tryRead(this.sacadoCepField, errors)

    if (sacadoDocumento != null || sacadoNome != null || sacadoLogradouro != null || sacadoCep != null) {
      data.sacado = {}
      
      if (sacadoDocumento != null) {
        data.sacado.documento = sacadoDocumento
      }
      
      if (sacadoNome != null) {
        data.sacado.nome = sacadoNome
      }
      
      if (sacadoLogradouro != null || sacadoCep != null) {
        data.sacado.endereco = {}
        
        if (sacadoLogradouro != null) {
          data.sacado.endereco.logradouro = sacadoLogradouro
        }
        
        if (sacadoCep != null) {
          data.sacado.endereco.cep = sacadoCep
        }
      }
    }

    return { data, errors }
  }

  readFull(): BoletoReadResult {
    if (this.structuralError != null) {
      return { data: {}, errors: [this.structuralError] }
    }
    
    const { data, errors } = this.readSimple()

    for (const field of this.extraFields) {
      const value = this.tryRead(field, errors)
      if (value != null) {
        data.extra ??= {}
        data.extra[field.fieldKey] = value
      }
    }

    return { data, errors }
  }

  readField(fieldName: BoletoFieldName): CnabFieldValue {
    if (this.structuralError != null) {
      throw this.structuralError
    }
    
    const field = this.fieldMap[fieldName]
    
    if (field == null) {
      throw new CNABFieldNotFoundError(fieldName, false)
    }

    return field.read(this.rawContent)
  }

  readExtraField(fieldKey: string): CnabFieldValue {
    if (this.structuralError != null) {
      throw this.structuralError
    }
    
    const extraField = this.extraFields.find(field => field.fieldKey === fieldKey)
    
    if (extraField == null) {
      throw new CNABFieldNotFoundError(fieldKey, true)
    }

    return extraField.read(this.rawContent)
  }

  read(mode: ReadMode = ReadMode.SIMPLE): BoletoReadResult {
    if (mode === ReadMode.SIMPLE) {
      return this.readSimple()
    }
    return this.readFull()
  }
}
