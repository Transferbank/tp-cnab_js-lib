import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabSchemaRegistrationException } from '@cnab/exception/cnab-exception'
import { Cnab400HeaderLineStartValidator, Cnab400TrailerLineStartValidator} from '@cnab/validators/cnab400/cnab400-line-start-validator'

import * as ItauFields240 from '@cnab/bank/itau/cnab/cnab240/field/fields'
import * as ItauFields400 from '@cnab/bank/itau/cnab/cnab400/field/fields'
import * as CaixaFields240 from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import * as CaixaFields400 from '@cnab/bank/caixa/cnab/cnab400/field/fields'
import * as SicrediFields240 from '@cnab/bank/sicredi/cnab/cnab240/field/fields'
import * as SicrediFields400 from '@cnab/bank/sicredi/cnab/cnab400/field/fields'
import * as BradescoFields240 from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import * as BradescoFields400 from '@cnab/bank/bradesco/cnab/cnab400/field/fields'
import * as SantanderFields240 from '@cnab/bank/santander/cnab/cnab240/field/fields'
import * as SantanderFields400 from '@cnab/bank/santander/cnab/cnab400/field/fields'
import * as BancoDoBrasilFields240 from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as BancoDoBrasilFields400 from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'

import { Cnab240ItauGroupRule } from '@cnab/bank/itau/cnab/cnab240/cnab-240-itau-group-rule'
import { Cnab400ItauGroupRule } from '@cnab/bank/itau/cnab/cnab400/cnab-400-itau-group-rule'
import { Cnab240CaixaGroupRule } from '@cnab/bank/caixa/cnab/cnab240/cnab-240-caixa-group-rule'
import { Cnab400CaixaGroupRule } from '@cnab/bank/caixa/cnab/cnab400/cnab-400-caixa-group-rule'
import { Cnab240SicrediGroupRule } from '@cnab/bank/sicredi/cnab/cnab240/cnab-240-sicredi-group-rule'
import { Cnab400SicrediGroupRule } from '@cnab/bank/sicredi/cnab/cnab400/cnab-400-sicredi-group-rule'
import { Cnab240BradescoGroupRule } from '@cnab/bank/bradesco/cnab/cnab240/cnab-240-bradesco-group-rule'
import { Cnab400BradescoGroupRule } from '@cnab/bank/bradesco/cnab/cnab400/cnab-400-bradesco-group-rule'
import { Cnab240SantanderGroupRule } from '@cnab/bank/santander/cnab/cnab240/cnab-240-santander-group-rule'
import { Cnab400SantanderGroupRule } from '@cnab/bank/santander/cnab/cnab400/cnab-400-santander-group-rule'
import { Cnab240BancoDoBrasilGroupRule } from '@cnab/bank/banco-do-brasil/cnab/cnab240/cnab-240-banco-do-brasil-group-rule'
import { Cnab400BancoDoBrasilGroupRule } from '@cnab/bank/banco-do-brasil/cnab/cnab400/cnab-400-banco-do-brasil-group-rule'


function registerCnabSchemas(): CnabSchema[] {
  return [
    //BRADESCO
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BradescoGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          BradescoFields240.Cnab240BradescoBoletoNameField,
          BradescoFields240.Cnab240BradescoBoletoVencimentoField,
          BradescoFields240.Cnab240BradescoBoletoValorTituloField,
          BradescoFields240.Cnab240BradescoBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BradescoGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator]
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator]
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          BradescoFields400.Cnab400BradescoBoletoNameField,
          BradescoFields400.Cnab400BradescoBoletoVencimentoField,
          BradescoFields400.Cnab400BradescoBoletoValorTituloField,
          BradescoFields400.Cnab400BradescoBoletoSacadoDocumentoField
        ]
      })
    }),
    //ITAU
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240ItauGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          ItauFields240.Cnab240ItauBoletoNameField,
          ItauFields240.Cnab240ItauBoletoVencimentoField,
          ItauFields240.Cnab240ItauBoletoValorTituloField,
          ItauFields240.Cnab240ItauBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400ItauGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator]
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator]
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          ItauFields400.Cnab400ItauBoletoNameField,
          ItauFields400.Cnab400ItauBoletoVencimentoField,
          ItauFields400.Cnab400ItauBoletoValorTituloField,
          ItauFields400.Cnab400ItauBoletoSacadoDocumentoField
        ]
      })
    }),
    //SANTANDER
    new CnabSchema({
      bank: CnabBank.SANTANDER,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240SantanderGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          SantanderFields240.Cnab240SantanderBoletoNameField,
          SantanderFields240.Cnab240SantanderBoletoVencimentoField,
          SantanderFields240.Cnab240SantanderBoletoValorTituloField,
          SantanderFields240.Cnab240SantanderBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.SANTANDER,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400SantanderGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator]
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator]
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          SantanderFields400.Cnab400SantanderBoletoNameField,
          SantanderFields400.Cnab400SantanderBoletoVencimentoField,
          SantanderFields400.Cnab400SantanderBoletoValorTituloField,
          SantanderFields400.Cnab400SantanderBoletoSacadoDocumentoField
        ]
      })
    }),
    //BANCODOBRASIL
    new CnabSchema({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BancoDoBrasilGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          BancoDoBrasilFields240.Cnab240BancoDoBrasilBoletoNameField,
          BancoDoBrasilFields240.Cnab240BancoDoBrasilBoletoVencimentoField,
          BancoDoBrasilFields240.Cnab240BancoDoBrasilBoletoValorTituloField,
          BancoDoBrasilFields240.Cnab240BancoDoBrasilBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BancoDoBrasilGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator]
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator]
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          BancoDoBrasilFields400.Cnab400BancoDoBrasilBoletoNameField,
          BancoDoBrasilFields400.Cnab400BancoDoBrasilBoletoVencimentoField,
          BancoDoBrasilFields400.Cnab400BancoDoBrasilBoletoValorTituloField,
          BancoDoBrasilFields400.Cnab400BancoDoBrasilBoletoSacadoDocumentoField
        ]
      })
    }),   
    //CAIXA
    new CnabSchema({
      bank: CnabBank.CAIXA,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240CaixaGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          CaixaFields240.Cnab240CaixaBoletoNameField,
          CaixaFields240.Cnab240CaixaBoletoVencimentoField,
          CaixaFields240.Cnab240CaixaBoletoValorTituloField,
          CaixaFields240.Cnab240CaixaBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.CAIXA,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400CaixaGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator]
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator]
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          CaixaFields400.Cnab400CaixaBoletoNameField,
          CaixaFields400.Cnab400CaixaBoletoVencimentoField,
          CaixaFields400.Cnab400CaixaBoletoValorTituloField,
          CaixaFields400.Cnab400CaixaBoletoSacadoDocumentoField
        ]
      })
    }),
    //SICREDI
    new CnabSchema({
      bank: CnabBank.SICREDI,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240SicrediGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          SicrediFields240.Cnab240SicrediBoletoNameField,
          SicrediFields240.Cnab240SicrediBoletoVencimentoField,
          SicrediFields240.Cnab240SicrediBoletoValorTituloField,
          SicrediFields240.Cnab240SicrediBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.SICREDI,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400SicrediGroupRule(),
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator]
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator]
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [
          SicrediFields400.Cnab400SicrediBoletoNameField,
          SicrediFields400.Cnab400SicrediBoletoVencimentoField,
          SicrediFields400.Cnab400SicrediBoletoValorTituloField,
          SicrediFields400.Cnab400SicrediBoletoSacadoDocumentoField
        ]
      })
    }),
  ]
}

export function indexCnabSchemas(
  schemas: CnabSchema[]
): Record<CnabBank, Record<CnabFormat, CnabSchema>> {
  const keys = schemas.map(
    (schema: CnabSchema): [CnabBank, CnabFormat] => [schema.bank, schema.fmt]
  )

  const counts: Record<string, number> = {}
  for (const [bank, fmt] of keys) {
    const key = `${bank}:${fmt}`
    counts[key] = (counts[key] ?? 0) + 1
  }

  const duplicatedKey = Object.entries(counts).find(
    ([, count]: [string, number]) => count > 1
  )

  if (duplicatedKey != null) {
    const [key] = duplicatedKey
    const [bank, fmt] = key.split(':') as [CnabBank, CnabFormat]
    throw new CnabSchemaRegistrationException(bank, fmt)
  }

  const indexed: Record<string, Record<string, CnabSchema>> = {}
  for (const schema of schemas) {
    if (indexed[schema.bank] == null) {
      indexed[schema.bank] = {}
    }
    indexed[schema.bank][schema.fmt] = schema
  }

  return indexed as Record<CnabBank, Record<CnabFormat, CnabSchema>>
}

export const CNAB_BANK_SCHEMAS: Record<CnabBank, Record<CnabFormat, CnabSchema>> = indexCnabSchemas(registerCnabSchemas())