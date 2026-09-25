# @transferhub/cnab-lib-ts

Biblioteca TypeScript para leitura e validação de arquivos de remessa CNAB 240 e CNAB 400 (boletos bancários).

## Funcionalidades

- Detecção automática de banco, formato (CNAB 240 ou CNAB 400) e quantidade de boletos, a partir do próprio conteúdo do arquivo
- Validação do arquivo inteiro (tamanho e início de linha, campos de cada boleto), com a opção de já vir com a quebra por boleto individual (quais são válidos e quais não, e por quê)
- Erros de validação tipados, com linha, campo e mensagem
- Suporte a 7 bancos, em CNAB 240 e CNAB 400

> ⚠️ **A partir da versão 0.2.0, `read()` não está disponível** (lança exceção). Esta versão foca exclusivamente em validação. Se você depende de `read()`, permaneça na `0.1.1` até uma versão futura reimplementá-lo. Veja o [CHANGELOG](CHANGELOG.md).

## Bancos suportados

| Banco                   | CNAB 240 | CNAB 400 |
| ----------------------- | :------: | :------: |
| Banco do Brasil         |    ✅    |    ✅    |
| Bradesco                |    ✅    |    ✅    |
| Caixa Econômica Federal |    ✅    |    ✅    |
| Itaú                    |    ✅    |    ✅    |
| Santander               |    ✅    |    ✅    |
| Sicoob                  |    ✅    |    ✅    |
| Sicredi                 |    ✅    |    ✅    |

Campos de boleto validados hoje, para todos os bancos acima: nome do sacado, data de vencimento, valor do título e documento (CPF/CNPJ) do sacado.

## Instalação

```bash
npm install @transferhub/cnab-lib-ts
```

ou

```bash
yarn add @transferhub/cnab-lib-ts
```

Requer Node.js 18+ (usa a Web File API, disponível globalmente a partir dessa versão).

## Como usar

### Abrindo um arquivo CNAB

A partir de um `File` (por exemplo, um input de upload no navegador):

```ts
import { openCnabFile } from '@transferhub/cnab-lib-ts'

const cnabFile = await openCnabFile(file)
```

A partir das linhas já lidas (por exemplo, um arquivo lido no backend):

```ts
import { openCnabFileFromLines } from '@transferhub/cnab-lib-ts'

const cnabFile = openCnabFileFromLines(linhas) // string[]
```

Depois de aberto, o `CnabFile` já expõe o banco, o formato e a quantidade de boletos detectados:

```ts
cnabFile.bank // ex: 'bradesco'
cnabFile.format // ex: '240'
cnabFile.boletoCount // ex: 3
```

`boletoCount` é calculado uma única vez na abertura do arquivo (não recalcula a cada acesso) e é barato de obter — só identifica onde cada boleto começa, sem instanciar nem validar nenhum campo. Funciona mesmo em arquivos inválidos, já que não depende de validação alguma.

### Validando o arquivo inteiro

```ts
const resultado = cnabFile.validate()

resultado.isValid // true | false
resultado.errors // lista de erros encontrados (vazia se válido)
```

Por padrão a validação para no primeiro erro encontrado e não monta a quebra por boleto (mais rápido — é o modo pra quem só quer um `isValid` rápido). Passe `true` pra coletar todos os erros do arquivo **e** receber `boletos`, com o resultado de cada boleto individualmente:

```ts
const resultado = cnabFile.validate(true)

resultado.isValid // veredito do arquivo inteiro
resultado.errors  // todos os erros do arquivo (header, trailer e boletos), numa lista só
resultado.boletos // um item por boleto, cada um com seu próprio isValid/errors
```

```ts
for (const boleto of resultado.boletos ?? []) {
  console.log(
    `Boleto ${boleto.index} (linhas ${boleto.lineNumbers.join(', ')}): ${
      boleto.isValid ? 'válido' : 'inválido'
    }`
  )
  boleto.errors.forEach(erro => console.log(`  - ${erro.message}`))
}
```

Cada boleto do arquivo é avaliado individualmente e de forma independente: um boleto inválido não afeta a avaliação dos demais, e todos os boletos são sempre analisados, mesmo que o arquivo como um todo seja inválido. `boletos` só vem preenchido quando `validate(true)` é chamado — no modo padrão (`validate()`, sem argumento) ele fica `undefined`, já que montar a quebra por boleto tem um custo que nem todo chamador quer pagar.

### Tratando erros de validação

Todo erro implementa `CnabValidationError`, com `errorType` (`'line'` ou `'field'`), `lineNumber` e `message`. Erros de campo (`CnabFieldValidationError`) também trazem `fieldName` e `range`.

```ts
import { CnabFieldValidationError } from '@transferhub/cnab-lib-ts'

for (const erro of resultado.errors) {
  if (erro instanceof CnabFieldValidationError) {
    console.log(erro.fieldName, erro.message)
  }
}
```

## Exemplo completo

Veja [main.ts](main.ts) para um exemplo executável (`npm run demo`) que abre arquivos reais de vários bancos, valida o arquivo inteiro e cada boleto individualmente, e mostra os erros encontrados.
