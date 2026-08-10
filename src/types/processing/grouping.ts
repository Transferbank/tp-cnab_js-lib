export type GroupingRecordType = 'core' | 'satellite' | 'structural'

export interface GroupingRule {
  mandatoryCore: string[]
  optionalSatellites: string[]
  structural: string[]
}
