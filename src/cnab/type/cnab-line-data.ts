import { CnabField } from '@cnab/type/cnab-field'

export class CnabLineData {
  [fieldName: string]: unknown
  readonly rawLine: string
  readonly lineNumber: number
  private readonly fieldsMap: Map<string, CnabField<unknown>>

  constructor(config: {
    rawLine: string
    lineNumber: number
    fields: CnabField<unknown>[]
  }) {
    this.rawLine = config.rawLine
    this.lineNumber = config.lineNumber
    this.fieldsMap = new Map(config.fields.map(field => [field.fieldName, field]))

    // TODO: considerar também ownKeys + getOwnPropertyDescriptor, pra Object.keys(lineData)/
    // {...lineData}/console.log enumerarem os campos dinâmicos (hoje só rawLine/lineNumber
    // aparecem). Fica pra depois: as invariantes de ownKeys do Proxy exigem descriptor
    // coerente pra cada chave reportada, senão lança TypeError.
    return new Proxy(this, {
      get(target, prop: string | symbol): unknown {
        if (prop in target) {
          return Reflect.get(target, prop)
        }

        if (typeof prop === 'string') {
          if (target.fieldsMap.has(prop)) {
            return target.fieldsMap.get(prop)!.value
          }
          throw new Error(
            `Campo desconhecido: '${prop}'. Campos disponíveis: ${[...target.fieldsMap.keys()].join(', ')}`
          )
        }

        return undefined
      },

      set(_target, prop): never {
        throw new Error(`CnabLineData é somente leitura — não é possível definir '${String(prop)}'`)
      },

      has(target, prop): boolean {
        return prop in target || (typeof prop === 'string' && target.fieldsMap.has(prop))
      }
    })
  }

  getField<T>(fieldName: string): CnabField<T> | undefined {
    return this.fieldsMap.get(fieldName) as CnabField<T> | undefined
  }

  get<T>(fieldName: string): T | null | undefined {
    return this.getField<T>(fieldName)?.value
  }

  get fields(): CnabField<unknown>[] {
    return Array.from(this.fieldsMap.values())
  }

  get fieldNames(): string[] {
    return Array.from(this.fieldsMap.keys())
  }

  hasField(fieldName: string): boolean {
    return this.fieldsMap.has(fieldName)
  }

  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      _meta: {
        rawLine: this.rawLine,
        lineNumber: this.lineNumber
      }
    }

    for (const [fieldName, field] of this.fieldsMap) {
      result[fieldName] = field.value
    }

    return result
  }
}
