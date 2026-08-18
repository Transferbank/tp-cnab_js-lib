import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import * as BradescoCnab240Fields from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import * as BradescoCnab400Fields from '@cnab/bank/bradesco/cnab/cnab400/field/fields'
import {
  Cnab400HeaderLineStartValidator,
  Cnab400TrailerLineStartValidator
} from '@cnab/validators/cnab400/cnab400-line-start-validator'

export const CNAB_BANK_SCHEMAS: Record<string, Record<string, CnabSchema>> = {
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: new CnabSchema({
      header: new CnabLineSchema({
        fmt: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: [BradescoCnab240Fields.Cnab240BradescoHeaderDataGeracaoField]
      }),
      trailer: new CnabLineSchema({
        fmt: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        fmt: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: [
          BradescoCnab240Fields.Cnab240BradescoBoletoNossoNumeroField,
          BradescoCnab240Fields.Cnab240BradescoBoletoNumeroDocumentoEmissorField,
          BradescoCnab240Fields.Cnab240BradescoBoletoSacadoDocumentoField,
          BradescoCnab240Fields.Cnab240BradescoBoletoNameField,
          BradescoCnab240Fields.Cnab240BradescoBoletoValorTituloField,
          BradescoCnab240Fields.Cnab240BradescoBoletoVencimentoField,
          BradescoCnab240Fields.Cnab240BradescoBoletoDataEmissaoField,
          BradescoCnab240Fields.Cnab240BradescoBoletoMultaCodigoField,
          BradescoCnab240Fields.Cnab240BradescoBoletoMultaDataField,
          BradescoCnab240Fields.Cnab240BradescoBoletoMultaValorField,
          BradescoCnab240Fields.Cnab240BradescoBoletoDescontoDataField,
          BradescoCnab240Fields.Cnab240BradescoBoletoDescontoValorField,
          BradescoCnab240Fields.Cnab240BradescoBoletoAbatimentoField
        ]
      })
    }),
    [CnabFormat.CNAB400]: new CnabSchema({
      header: new CnabLineSchema({
        fmt: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: [BradescoCnab400Fields.Cnab400BradescoHeaderDataGeracaoField],
        validators: [Cnab400HeaderLineStartValidator]
      }),
      trailer: new CnabLineSchema({
        fmt: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator]
      }),
      boleto: new CnabLineSchema({
        fmt: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: [
          BradescoCnab400Fields.Cnab400BradescoBoletoNossoNumeroField,
          BradescoCnab400Fields.Cnab400BradescoBoletoNumeroDocumentoEmissorField,
          BradescoCnab400Fields.Cnab400BradescoBoletoSacadoDocumentoField,
          BradescoCnab400Fields.Cnab400BradescoBoletoNameField,
          BradescoCnab400Fields.Cnab400BradescoBoletoValorTituloField,
          BradescoCnab400Fields.Cnab400BradescoBoletoVencimentoField,
          BradescoCnab400Fields.Cnab400BradescoBoletoDataEmissaoField,
          BradescoCnab400Fields.Cnab400BradescoBoletoMultaField,
          BradescoCnab400Fields.Cnab400BradescoBoletoDescontoDataField,
          BradescoCnab400Fields.Cnab400BradescoBoletoDescontoValorField,
          BradescoCnab400Fields.Cnab400BradescoBoletoAbatimentoField
        ],
        validators: [Cnab400HeaderLineStartValidator]
      })
    })
  }
}