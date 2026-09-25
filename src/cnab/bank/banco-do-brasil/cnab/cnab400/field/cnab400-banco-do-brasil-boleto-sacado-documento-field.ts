import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

// Banco do Brasil usa registro de detalhe nao-padrao no CNAB400: comeca com '7'
// em vez do '1' usado pelos outros bancos.
export class Cnab400BancoDoBrasilBoletoSacadoDocumentoField extends Cnab400BoletoSacadoDocumentoField {
  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, '7')
  }
}
