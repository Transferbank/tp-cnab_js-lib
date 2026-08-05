import { CnabField } from '@/types/fields/cnab-field'
import { BoletoCnabData, CnabFieldValue } from '@/types/read/boleto-cnab-data'
import { CNABBoletoValidationError } from '@/types/errors/field-errors'

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
  private rawContent?: string[]
  
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

  constructor(rawContent?: string[]) {
    this.rawContent = rawContent
  }

  protected abstract validateStructure(rawContent: string[]): void

  protected throwStructureError(reason: string, lineNumber?: number): never {
    throw new CNABBoletoValidationError(reason, lineNumber)
  }

  setRawContent(rawContent: string[]): this {
    this.rawContent = rawContent
    return this
  }

  abstract readSimple(rawContent: string[]): T

  readField(fieldName: BoletoFieldName, rawContent?: string[]): CnabFieldValue {
    const content = rawContent ?? this.rawContent
    if (content == null) {
      throw new Error('Raw content não fornecido. Use setRawContent() ou passe rawContent como parâmetro.')
    }

    this.validateStructure(content)

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
      throw new Error(`Campo "${fieldName}" não encontrado`)
    }

    return field.read(content)
  }

  read(rawContent?: string[]): T {
    const content = rawContent ?? this.rawContent
    if (content == null) {
      throw new Error('Raw content não fornecido. Use setRawContent() ou passe rawContent como parâmetro.')
    }

    this.validateStructure(content)

    const data: BoletoCnabData = {
      nossoNumero: this.nossoNumeroField.read(content),
      numeroDocumento: this.numeroDocumentoField.read(content),
      vencimento: this.vencimentoField.read(content),
      valor: this.valorField.read(content),
      dataEmissao: this.dataEmissaoField.read(content),
      desconto: {
        valor: this.descontoValorField.read(content),
      },
      abatimento: {
        valor: this.abatimentoValorField.read(content),
      },
      sacado: {
        documento: this.sacadoDocumentoField.read(content),
        nome: this.sacadoNomeField.read(content),
        endereco: {
          logradouro: this.sacadoLogradouroField.read(content),
          cep: this.sacadoCepField.read(content),
        },
      },
    }

    if (this.extraFields.length > 0) {
      data.extra = {}
      for (const field of this.extraFields) {
        data.extra[field['description']] = field.read(content)
      }
    }

    return data as T
  }
}
