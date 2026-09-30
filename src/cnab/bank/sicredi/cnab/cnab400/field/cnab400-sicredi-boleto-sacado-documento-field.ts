import { DocumentType, documentTypeByIndicator } from '@cnab/utils/document-parser'
import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'

// Indicador ocupa só 1 char (pos. 219); 220 é filler fixo "0".
export class Cnab400SicrediBoletoSacadoDocumentoField extends Cnab400BoletoSacadoDocumentoField {
  protected documentType(): DocumentType | null {
    return documentTypeByIndicator(this.extractRangeFromLine(218, 219), '1', '2')
  }
}
