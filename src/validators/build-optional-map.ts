import type { BankSchema, OptionalRecordSchema } from '@tp-types/index'

export function buildOptionalMap(bankSchema: BankSchema): Map<string, OptionalRecordSchema> {
  return new Map(
    (bankSchema.optionalRecords ?? []).map(r => [r.identifier, r])
  )
}
