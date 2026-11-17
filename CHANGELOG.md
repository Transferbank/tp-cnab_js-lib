# Changelog

Mudanças da `@fx55/cnab-lib-ts` por versão. As versões seguem o [versionamento semântico](https://semver.org/lang/pt-BR/).

## Não publicado

### Mudanças que podem quebrar

- Os códigos de juros e de multa são validados pela tabela de cada banco. Um arquivo com código fora da tabela, antes aceito, passa a ser recusado por `read()`.
- No Banco do Brasil CNAB 240 e 400, `especie_do_titulo` é obrigatório. Um arquivo com a espécie em branco ou com um código fora da tabela do banco, antes aceito, passa a ser recusado por `read()`.

### Adicionado

- Juros: `juros` nos 14 layouts, `codigo_de_juros` nos layouts que têm o código, a data de juros como campo extra (`CNAB_DATA_DE_JUROS_FIELDS`) e `getTipoDeJuros` com `CnabTipoDeJuros`.
- Multa: `multa` nos 14 layouts, `codigo_de_multa` nos layouts que têm o código, a data de multa como campo extra (`CNAB_DATA_DE_MULTA_FIELDS`) e `getTipoDeMulta` com `CnabTipoDeMulta`.
- Espécie do título: `especie_do_titulo` no Banco do Brasil CNAB 240 e 400 e `getEspecieDoTitulo` com `CnabEspecieDoTitulo`.
