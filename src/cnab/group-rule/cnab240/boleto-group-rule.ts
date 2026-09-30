import { CnabBoletoGroupRule, CnabBoletoGroupSegmentRule } from '@cnab/type/cnab-boleto-group-rule'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BoletoGroupRule extends CnabBoletoGroupRule {
  protected readonly segmentRules: CnabBoletoGroupSegmentRule[] = [
    {
      name: 'segmento Q',
      required: true,
      matches: (rawLine: string): boolean => Cnab240LineTypeChecker.isSegmentoQ(rawLine)
    },
    {
      name: 'segmento R',
      required: false,
      matches: (rawLine: string): boolean => Cnab240LineTypeChecker.isSegmentoR(rawLine)
    }
  ]

  check(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }

  // Header e trailer de lote podem aparecer fora de um boleto; só o detalhe não
  isBoletoLine(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isDetalhe(rawLine)
  }

  describeLine(rawLine: string): string {
    return `segmento ${rawLine[13]}`
  }
}
