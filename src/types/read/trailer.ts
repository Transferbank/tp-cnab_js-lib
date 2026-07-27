/**
 * Dados do trailer do arquivo CNAB.
 * Maioria dos bancos não expõe muita informação útil no trailer.
 */
export interface CNABTrailer {
  quantidadeRegistros?: number
  quantidadeLotes?: number // apenas CNAB 240
  valorTotal?: number // apenas alguns bancos (ex: Santander CNAB 400)
}
