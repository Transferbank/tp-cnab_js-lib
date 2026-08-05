import { FieldValidator } from './field-validator'

export class CustomValidator implements FieldValidator {
  constructor(
    private readonly validateFn: (raw: string) => boolean,
    readonly errorMessage: string
  ) {}

  validate(raw: string): boolean {
    return this.validateFn(raw)
  }
}
