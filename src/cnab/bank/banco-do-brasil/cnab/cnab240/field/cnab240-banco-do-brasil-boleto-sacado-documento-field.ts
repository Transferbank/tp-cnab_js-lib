import { DocumentType, documentTypeByIndicator } from '@cnab/utils/document-parser'
import { Cnab240BoletoSacadoDocumentoField } from '@cnab/field/cnab240/boleto-sacado-documento-field'

// BB aceita "0" como indicador, tratado como CNPJ.
export class Cnab240BancoDoBrasilBoletoSacadoDocumentoField extends Cnab240BoletoSacadoDocumentoField {
  protected documentType(): DocumentType | null {
    const tipoInscricao = this.extractRangeFromLine(17, 18)
    return documentTypeByIndicator(tipoInscricao == '0' ? '2' : tipoInscricao, '1', '2')
  }
}
