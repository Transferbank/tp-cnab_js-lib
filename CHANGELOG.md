# Changelog

Mudanças da `@fx55/cnab-lib-ts` por versão. As versões seguem o [versionamento semântico](https://semver.org/lang/pt-BR/).

## Não publicado

### Mudanças que podem quebrar

- Os códigos de juros e de multa são validados pela tabela de cada banco. Um arquivo com código fora da tabela, antes aceito, passa a ser recusado por `read()`.
- `especie_do_titulo` é obrigatório nos 14 layouts. Um arquivo com a espécie em branco ou com um código fora da tabela do banco, antes aceito, passa a ser recusado por `read()`.
- O tipo de arquivo é lido do header (posição 2 no CNAB 400 e 143 no CNAB 240). Um arquivo cujo header não indica remessa (`1`) nem retorno (`2`), antes aceito, passa a lançar `CnabFileTypeNotRecognizedException` ao ser aberto.
- No CNAB 240, o tipo de registro de cada linha é validado, do header de arquivo ao trailer de arquivo, inclusive nas linhas antes do primeiro boleto. Um arquivo com tipo de registro errado, antes aceito, passa a ser recusado por `read()` com `CnabInvalidRecordTypeError`.
- `CnabBankSchemaNotFoundException` recebe também o tipo de arquivo, e a mensagem passa a dizer se o formato não é suportado na remessa ou no retorno.

### Adicionado

- Leitura do lote de validação (arquivo retorno) CNAB 240 e CNAB 400 nos 7 bancos, aberto pelas mesmas funções da remessa. O tipo do arquivo fica em `cnabFile.fileType`, com `CnabFileType`.
- Retorno: `codigo_de_ocorrencia` nos 14 layouts, com `getOcorrencia` e `getOcorrenciaDescription`, que traduzem o código do banco para `CnabOcorrencia`, e `CNAB_OCORRENCIA_DESCRIPTIONS`.
- `header` e `trailer` no `Cnab`, cada um com seus `fields`. Campos extras com `CnabFieldType.HEADER` ou `CnabFieldType.TRAILER` são lidos neles, fora dos boletos.
- Juros: `juros` nos 14 layouts, `codigo_de_juros` nos layouts que têm o código, a data de juros como campo extra (`CNAB_DATA_DE_JUROS_FIELDS`) e `getTipoDeJuros` com `CnabTipoDeJuros`.
- Multa: `multa` nos 14 layouts, `codigo_de_multa` nos layouts que têm o código, a data de multa como campo extra (`CNAB_DATA_DE_MULTA_FIELDS`) e `getTipoDeMulta` com `CnabTipoDeMulta`.
- Espécie do título: `especie_do_titulo` nos 14 layouts e `getEspecieDoTitulo` com `CnabEspecieDoTitulo`.
- Retorno: `valor_pago`, o total pago pelo pagador, em 13 dos 14 layouts (todos menos o Itaú CNAB 240).
- Retorno: `juros_multa`, os encargos pagos pelo pagador, em 11 dos 14 layouts (todos menos a Caixa CNAB 400, o Sicredi CNAB 400 e o Itaú CNAB 240).
- Retorno: `juros_pago` e `multa_paga` na Caixa CNAB 400 e no Sicredi CNAB 400, que mandam juros e multa em posições separadas.
- Retorno: `data_de_ocorrencia`, a data em que o banco registrou a ocorrência, nos 14 layouts.
- Retorno: `seu_numero`, o número do documento dado pelo beneficiário, nos 14 layouts.
- Retorno: `uso_da_empresa`, a identificação do boleto na empresa, em 13 dos 14 layouts (o Sicredi CNAB 400 não tem o campo).
- Retorno: `nosso_numero`, a identificação do boleto no banco, nos 14 layouts.
- Escrita do lote de validação CNAB 400: `CnabWriter.write`, com `CnabWriteNotSupportedException` para formato ou tipo de arquivo sem escrita.
