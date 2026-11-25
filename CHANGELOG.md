# Changelog

Mudanças da `@fx55/cnab-lib-ts` por versão. As versões seguem o [versionamento semântico](https://semver.org/lang/pt-BR/).

## Não publicado

### Mudanças que podem quebrar

- Os códigos de juros e de multa são validados pela tabela de cada banco. Um arquivo com código fora da tabela, antes aceito, passa a ser recusado por `read()`.
- `especie_do_titulo` é obrigatório nos 14 layouts. Um arquivo com a espécie em branco ou com um código fora da tabela do banco, antes aceito, passa a ser recusado por `read()`.
- No Banco do Brasil, juros e multa dos boletos de espécie `31` (cartão de crédito) ou `32` (boleto de proposta) não são validados nem lidos. Um arquivo com juros ou multa inválidos nesses boletos, antes recusado, passa a ser aceito, e esses campos deixam de aparecer em `read()`.

### Adicionado

- Juros: `juros` nos 14 layouts, `codigo_de_juros` nos layouts que têm o código, a data de juros como campo extra (`CNAB_DATA_DE_JUROS_FIELDS`) e `getTipoDeJuros` com `CnabTipoDeJuros`.
- Multa: `multa` nos 14 layouts, `codigo_de_multa` nos layouts que têm o código, a data de multa como campo extra (`CNAB_DATA_DE_MULTA_FIELDS`) e `getTipoDeMulta` com `CnabTipoDeMulta`.
- Espécie do título: `especie_do_titulo` nos 14 layouts e `getEspecieDoTitulo` com `CnabEspecieDoTitulo`.
- Validação e leitura no boleto inteiro: um `CnabField` que declara `dependencies` é validado e lido com todas as linhas do boleto, por `validateInGroup` e `readInGroup`, e lê os campos de que depende com `groupValue`. Ler um campo que não está em `dependencies` lança `CnabFieldDependencyNotDeclaredException`. O tipo `CnabNumberedLine` descreve as linhas do boleto.
