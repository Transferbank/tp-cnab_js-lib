export interface FieldValidator {
  readonly errorMessage: string
  validate(raw: string): boolean
}
