import type { BankSchema, OptionalRecordSchema } from '@/types/all-types'

export function buildOptionalMap(bankSchema: BankSchema): Map<string, OptionalRecordSchema> {
  return new Map(
    (bankSchema.optionalRecords ?? []).map(r => [r.identifier, r])
  )
}
