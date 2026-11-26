import { CnabField, CnabFieldClass, CnabNumberedLine } from '@cnab/type/cnab-field'
import {
  CnabFieldDependencyCycleException,
  CnabFieldDependencyNotDeclaredException
} from '@cnab/exception/cnab-exception'
import { CnabFieldParseError } from '@cnab/type/cnab-validation-error'

export class CnabGroupReader {
  private readonly lines: CnabNumberedLine[]
  private readonly declared: CnabFieldClass[]
  private readonly fieldKey: string
  private readonly reading: CnabFieldClass[]

  constructor(lines: CnabNumberedLine[], declared: CnabFieldClass[], fieldKey: string, reading: CnabFieldClass[] = []) {
    this.lines = lines
    this.declared = declared
    this.fieldKey = fieldKey
    this.reading = reading
  }

  read<V>(fieldClass: CnabFieldClass<V>): V | null {
    if (!this.declared.includes(fieldClass)) {
      throw new CnabFieldDependencyNotDeclaredException(this.fieldKey, fieldClass.name)
    }
    const reading = [...this.reading, fieldClass]
    if (this.reading.includes(fieldClass)) {
      const cycleNames = reading.map(readingClass => readingClass.name)
      throw new CnabFieldDependencyCycleException(this.fieldKey, cycleNames.join(' → '))
    }
    let value: V | null = null
    for (const { lineNumber, rawLine } of this.lines) {
      const field = new fieldClass(rawLine, lineNumber)
      if (!field.shouldValidate()) {
        continue
      }
      const fieldReader = new CnabGroupReader(this.lines, fieldClass.dependencies, field.fieldKey, reading)
      const lineValue = readableInGroup(field, fieldReader)
      if (lineValue == null) {
        continue
      }
      value = value == null ? lineValue : field.handleDuplicatedValue(value, lineValue)
    }
    return value
  }
}

function readableInGroup<V>(field: CnabField<V>, group: CnabGroupReader): V | null {
  try {
    return field.readInGroup(group)
  } catch (error) {
    if (error instanceof CnabFieldParseError) {
      return null
    }
    throw error
  }
}
