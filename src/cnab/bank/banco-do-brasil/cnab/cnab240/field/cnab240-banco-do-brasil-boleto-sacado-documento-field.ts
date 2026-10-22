import { DocumentType, documentTypeByIndicator } from '@cnab/utils/document-parser'
import * as Cnab240 from '@cnab/field/cnab240/fields'

// BB aceita "0" como indicador, tratado como CNPJ.
export class Cnab240BancoDoBrasilBoletoSacadoDocumentoField extends Cnab240.DocumentoSacadoBoletoField {
  protected documentType(): DocumentType | null {
    const tipoInscricao = this.extractRangeFromLine(17, 18)
    return documentTypeByIndicator(tipoInscricao == '0' ? '2' : tipoInscricao, '1', '2')
  }
}
