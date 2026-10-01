import { CnabNumberedLine } from '@cnab/type/cnab-numbered-line'
import { CnabBoletoGroupRule, CnabBoletoGroupSegmentRule } from '@cnab/type/cnab-boleto-group-rule'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

// Código de movimento do segmento P (posições 16-17): '01' é a entrada de títulos, o registro de um boleto novo.
// Pela FEBRABAN, o segmento Q é obrigatório só nesse caso; em instruções e alterações (baixa, prorrogação...) é opcional.
// Alguns bancos exigem o Q em qualquer movimento; o cadastro de segmentos por banco, que entra depois no código,
//  vai permitir que cada banco aplique a própria regra.
const MOVIMENTO_ENTRADA_DE_TITULOS = '01'

function isSegmentoPDeEntradaDeTitulos(group: CnabNumberedLine[]): boolean {
  const [, segmentoP] = group[0]
  return segmentoP.substring(15, 17) == MOVIMENTO_ENTRADA_DE_TITULOS
}

export class Cnab240BoletoGroupRule extends CnabBoletoGroupRule {
  protected readonly segmentRules: CnabBoletoGroupSegmentRule[] = [
    {
      name: 'segmento Q',
      matches: (rawLine: string): boolean => Cnab240LineTypeChecker.isSegmentoQ(rawLine),
      isRequired: isSegmentoPDeEntradaDeTitulos
    },
    {
      name: 'segmento R',
      matches: (rawLine: string): boolean => Cnab240LineTypeChecker.isSegmentoR(rawLine),
      isRequired: (): boolean => false
    }
  ]

  check(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }
}
