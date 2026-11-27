# Changelog

Mudanças da `@fx55/cnab-lib-ts` por versão. As versões seguem o [versionamento semântico](https://semver.org/lang/pt-BR/).

## Não publicado

### Mudanças que podem quebrar

- Os códigos de juros e de multa são validados pela tabela de cada banco. Um arquivo com código fora da tabela, antes aceito, passa a ser recusado por `read()`.
- `especie_do_titulo` é obrigatório nos 14 layouts. Um arquivo com a espécie em branco ou com um código fora da tabela do banco, antes aceito, passa a ser recusado por `read()`.
- No Banco do Brasil, juros e multa dos boletos de espécie `31` (cartão de crédito) ou `32` (boleto de proposta) não são validados nem lidos. Um arquivo com juros ou multa inválidos nesses boletos, antes recusado, passa a ser aceito, e esses campos deixam de aparecer em `read()`. Nos demais boletos do Banco do Brasil, os erros de juros e de multa aparecem depois dos outros erros do boleto, e as chaves desses campos entram em `fields` depois das demais.

### Adicionado

- Juros: `juros` nos 14 layouts, `codigo_de_juros` nos layouts que têm o código, a data de juros como campo extra (`CNAB_DATA_DE_JUROS_FIELDS`) e `getTipoDeJuros` com `CnabTipoDeJuros`.
- Multa: `multa` nos 14 layouts, `codigo_de_multa` nos layouts que têm o código, a data de multa como campo extra (`CNAB_DATA_DE_MULTA_FIELDS`) e `getTipoDeMulta` com `CnabTipoDeMulta`.
- Espécie do título: `especie_do_titulo` nos 14 layouts e `getEspecieDoTitulo` com `CnabEspecieDoTitulo`.
- Validação e leitura no boleto inteiro: um campo com `resolvesInGroup` recebe as linhas do boleto, como `CnabNumberedLine`, em `validateInGroup`, que decide o resultado final da validação, e em `readInGroup`, que decide o valor lido. Dentro deles, `readFieldInGroup` lê outro campo em qualquer linha do mesmo boleto.

### Corrigido

- `read()` não lê mais as linhas de header e trailer como parte dos boletos: um campo de boleto que aceitasse a linha de trailer era lido no último boleto.
