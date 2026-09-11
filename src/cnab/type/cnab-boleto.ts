import { CnabLineData } from '@cnab/type/cnab-line-data'

export class CnabBoleto {
  [fieldName: string]: unknown
  readonly lines: CnabLineData[]
  private readonly fieldIndex: Map<string, CnabLineData>

  constructor(lines: CnabLineData[]) {
    this.lines = lines
    this.fieldIndex = this.buildFieldIndex(lines)

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
        }

        return undefined
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
