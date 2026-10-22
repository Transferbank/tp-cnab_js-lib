import { DocumentType, documentTypeByIndicator } from '@cnab/utils/document-parser'
import * as Cnab400 from '@cnab/field/cnab400/fields'

// Indicador ocupa só 1 char (pos. 219); 220 é filler fixo "0".
export class Cnab400SicrediBoletoSacadoDocumentoField extends Cnab400.DocumentoSacadoBoletoField {
  protected documentType(): DocumentType | null {
    return documentTypeByIndicator(this.extractRangeFromLine(218, 219), '1', '2')
  }
}
