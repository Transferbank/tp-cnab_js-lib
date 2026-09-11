import { CnabLineData } from '@cnab/type/cnab-line-data'

export class CnabBoleto {
  [fieldName: string]: unknown
  readonly lines: CnabLineData[]
  private readonly fieldIndex: Map<string, CnabLineData>

  constructor(lines: CnabLineData[]) {
    this.lines = lines
    this.fieldIndex = this.buildFieldIndex(lines)

    // TODO: considerar também ownKeys + getOwnPropertyDescriptor, pra Object.keys(boleto)/
    // {...boleto}/console.log enumerarem os campos dinâmicos (hoje só lines aparece). Fica
    // pra depois: as invariantes de ownKeys do Proxy exigem descriptor coerente pra cada
    // chave reportada, senão lança TypeError.
    return new Proxy(this, {
      get(target, prop: string | symbol): unknown {
        if (prop in target) {
          return Reflect.get(target, prop)
        }

        if (typeof prop === 'string') {
          const line = target.fieldIndex.get(prop)
          if (line != null) {
            return line.get(prop)
          }
          throw new Error(
            `Campo desconhecido: '${prop}'. Campos disponíveis: ${[...target.fieldIndex.keys()].join(', ')}`
          )
        }

        return undefined
      },

      set(_target, prop): never {
        throw new Error(`CnabBoleto é somente leitura — não é possível definir '${String(prop)}'`)
      },

      has(target, prop): boolean {
        return prop in target || (typeof prop === 'string' && target.fieldIndex.has(prop))
      }
    })
  }

  private buildFieldIndex(lines: CnabLineData[]): Map<string, CnabLineData> {
    const index = new Map<string, CnabLineData>()
    for (const line of lines) {
      for (const fieldName of line.fieldNames) {
        if (!index.has(fieldName)) {
          index.set(fieldName, line)
        }
      }
    }
    return index
  }

  get lineCount(): number {
    return this.lines.length
  }

  hasField(fieldName: string): boolean {
    return this.fieldIndex.has(fieldName)
  }
}
