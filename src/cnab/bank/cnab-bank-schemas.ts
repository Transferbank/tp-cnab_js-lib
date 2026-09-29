import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabSchemaRegistrationException } from '@cnab/exception/cnab-exception'
import { Cnab400HeaderLineStartValidator, Cnab400TrailerLineStartValidator} from '@cnab/validators/cnab400/cnab400-line-start-validator'
import { Cnab240BoletoNomeField } from '@cnab/field/cnab240/boleto-nome-field'
import { Cnab400BoletoNomeField } from '@cnab/field/cnab400/boleto-nome-field'
import { Cnab240BoletoSacadoDocumentoField } from '@cnab/field/cnab240/boleto-sacado-documento-field'
import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'
import { Cnab240BoletoValorTituloField } from '@cnab/field/cnab240/boleto-valor-titulo-field'
import { Cnab400BoletoValorTituloField } from '@cnab/field/cnab400/boleto-valor-titulo-field'
import { Cnab240BoletoVencimentoField } from '@cnab/field/cnab240/boleto-vencimento-field'
import { Cnab400BoletoVencimentoField } from '@cnab/field/cnab400/boleto-vencimento-field'
import { Cnab240BoletoCepField } from '@cnab/field/cnab240/boleto-cep-field'
import { Cnab400BoletoCepField } from '@cnab/field/cnab400/boleto-cep-field'
import { Cnab240BoletoEnderecoField } from '@cnab/field/cnab240/boleto-endereco-field'
import { Cnab400BoletoEnderecoField } from '@cnab/field/cnab400/boleto-endereco-field'
import { Cnab240BoletoBairroField } from '@cnab/field/cnab240/boleto-bairro-field'
import { Cnab400BoletoBairroField } from '@cnab/field/cnab400/boleto-bairro-field'
import { Cnab240BoletoCidadeField } from '@cnab/field/cnab240/boleto-cidade-field'
import { Cnab400BoletoCidadeField } from '@cnab/field/cnab400/boleto-cidade-field'
import { Cnab240BoletoUfField } from '@cnab/field/cnab240/boleto-uf-field'
import { Cnab400BoletoUfField } from '@cnab/field/cnab400/boleto-uf-field'

import * as SicrediFields400 from '@cnab/bank/sicredi/cnab/cnab400/field/fields'
import * as BancoDoBrasilFields240 from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as BancoDoBrasilFields400 from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'

import { Cnab240ItauGroupRule } from '@cnab/bank/itau/cnab/cnab240/cnab-240-itau-group-rule'
import { Cnab400ItauGroupRule } from '@cnab/bank/itau/cnab/cnab400/cnab-400-itau-group-rule'
import { Cnab240CaixaGroupRule } from '@cnab/bank/caixa/cnab/cnab240/cnab-240-caixa-group-rule'
import { Cnab400CaixaGroupRule } from '@cnab/bank/caixa/cnab/cnab400/cnab-400-caixa-group-rule'
import { Cnab240SicoobGroupRule } from '@cnab/bank/sicoob/cnab/cnab240/cnab-240-sicoob-group-rule'
import { Cnab400SicoobGroupRule } from '@cnab/bank/sicoob/cnab/cnab400/cnab-400-sicoob-group-rule'
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
    // BRADESCO
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BradescoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab240BoletoNomeField(),
          Cnab240BoletoVencimentoField,
          Cnab240BoletoValorTituloField,
          Cnab240BoletoSacadoDocumentoField,
          Cnab240BoletoEnderecoField,
          Cnab240BoletoBairroField,
          Cnab240BoletoCepField,
          Cnab240BoletoCidadeField,
          Cnab240BoletoUfField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BradescoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab400BoletoNomeField(),
          Cnab400BoletoVencimentoField(),
          Cnab400BoletoValorTituloField(),
          Cnab400BoletoSacadoDocumentoField,
          Cnab400BoletoEnderecoField(),
          Cnab400BoletoCepField()
        ],
      },
    }),
    // ITAU
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240ItauGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab240BoletoNomeField(34, 63),
          Cnab240BoletoVencimentoField,
          Cnab240BoletoValorTituloField,
          Cnab240BoletoSacadoDocumentoField,
          Cnab240BoletoEnderecoField,
          Cnab240BoletoBairroField,
          Cnab240BoletoCepField,
          Cnab240BoletoCidadeField,
          Cnab240BoletoUfField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400ItauGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab400BoletoNomeField(235, 264),
          Cnab400BoletoVencimentoField(),
          Cnab400BoletoValorTituloField(),
          Cnab400BoletoSacadoDocumentoField,
          Cnab400BoletoEnderecoField(),
          Cnab400BoletoBairroField(),
          Cnab400BoletoCepField(),
          Cnab400BoletoCidadeField(),
          Cnab400BoletoUfField()
        ],
      },
    }),
    // SANTANDER
    new CnabSchema({
      bank: CnabBank.SANTANDER,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240SantanderGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab240BoletoNomeField(),
          Cnab240BoletoVencimentoField,
          Cnab240BoletoValorTituloField,
          Cnab240BoletoSacadoDocumentoField,
          Cnab240BoletoEnderecoField,
          Cnab240BoletoBairroField,
          Cnab240BoletoCepField,
          Cnab240BoletoCidadeField,
          Cnab240BoletoUfField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.SANTANDER,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400SantanderGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab400BoletoNomeField(),
          Cnab400BoletoVencimentoField(),
          Cnab400BoletoValorTituloField(),
          Cnab400BoletoSacadoDocumentoField,
          Cnab400BoletoEnderecoField(),
          Cnab400BoletoBairroField(),
          Cnab400BoletoCepField(),
          Cnab400BoletoCidadeField(),
          Cnab400BoletoUfField()
        ],
      },
    }),
    // BANCO DO BRASIL
    new CnabSchema({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BancoDoBrasilGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab240BoletoNomeField(),
          Cnab240BoletoVencimentoField,
          Cnab240BoletoValorTituloField,
          BancoDoBrasilFields240.Cnab240BancoDoBrasilBoletoSacadoDocumentoField,
          Cnab240BoletoEnderecoField,
          BancoDoBrasilFields240.Cnab240BancoDoBrasilBoletoBairroField,
          Cnab240BoletoCepField,
          Cnab240BoletoCidadeField,
          Cnab240BoletoUfField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BancoDoBrasilGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab400BoletoNomeField(235, 271, '7'),
          Cnab400BoletoVencimentoField('7'),
          Cnab400BoletoValorTituloField('7'),
          BancoDoBrasilFields400.Cnab400BancoDoBrasilBoletoSacadoDocumentoField,
          Cnab400BoletoEnderecoField(275, 314, '7'),
          Cnab400BoletoBairroField(315, 326, '7'),
          Cnab400BoletoCepField('7'),
          Cnab400BoletoCidadeField('7'),
          Cnab400BoletoUfField('7')
        ],
      },
    }),
    // CAIXA
    new CnabSchema({
      bank: CnabBank.CAIXA,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240CaixaGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab240BoletoNomeField(),
          Cnab240BoletoVencimentoField,
          Cnab240BoletoValorTituloField,
          Cnab240BoletoSacadoDocumentoField,
          Cnab240BoletoEnderecoField,
          Cnab240BoletoBairroField,
          Cnab240BoletoCepField,
          Cnab240BoletoCidadeField,
          Cnab240BoletoUfField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.CAIXA,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400CaixaGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab400BoletoNomeField(),
          Cnab400BoletoVencimentoField(),
          Cnab400BoletoValorTituloField(),
          Cnab400BoletoSacadoDocumentoField,
          Cnab400BoletoEnderecoField(),
          Cnab400BoletoBairroField(),
          Cnab400BoletoCepField(),
          Cnab400BoletoCidadeField(),
          Cnab400BoletoUfField()
        ],
      },
    }),
    // SICREDI
    new CnabSchema({
      bank: CnabBank.SICREDI,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240SicrediGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab240BoletoNomeField(),
          Cnab240BoletoVencimentoField,
          Cnab240BoletoValorTituloField,
          Cnab240BoletoSacadoDocumentoField,
          Cnab240BoletoEnderecoField,
          Cnab240BoletoCepField,
          Cnab240BoletoCidadeField,
          Cnab240BoletoUfField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.SICREDI,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400SicrediGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab400BoletoNomeField(),
          Cnab400BoletoVencimentoField(),
          Cnab400BoletoValorTituloField(),
          SicrediFields400.Cnab400SicrediBoletoSacadoDocumentoField,
          Cnab400BoletoEnderecoField(),
          Cnab400BoletoCepField()
        ],
      },
    }),
    // SICOOB
    new CnabSchema({
      bank: CnabBank.SICOOB,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240SicoobGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab240BoletoNomeField(),
          Cnab240BoletoVencimentoField,
          Cnab240BoletoValorTituloField,
          Cnab240BoletoSacadoDocumentoField,
          Cnab240BoletoEnderecoField,
          Cnab240BoletoBairroField,
          Cnab240BoletoCepField,
          Cnab240BoletoCidadeField,
          Cnab240BoletoUfField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.SICOOB,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400SicoobGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          Cnab400BoletoNomeField(),
          Cnab400BoletoVencimentoField(),
          Cnab400BoletoValorTituloField(),
          Cnab400BoletoSacadoDocumentoField,
          Cnab400BoletoEnderecoField(275, 311),
          Cnab400BoletoBairroField(312, 326),
          Cnab400BoletoCepField(),
          Cnab400BoletoCidadeField(),
          Cnab400BoletoUfField()
        ],
      },
    }),
  ]
}

export function indexCnabSchemas(
  schemas: CnabSchema[]
): Record<CnabBank, Record<CnabFormat, CnabSchema>> {
  const keys = schemas.map((schema: CnabSchema): [CnabBank, CnabFormat] => [
    schema.bank,
    schema.fmt,
  ])

  const counts: Record<string, number> = {}
  for (const [bank, fmt] of keys) {
    const key = `${bank}:${fmt}`
    counts[key] = (counts[key] ?? 0) + 1
  }

  const duplicatedKey = Object.entries(counts).find(([, count]: [string, number]) => count > 1)

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
