# @transferhub/cnab-lib-ts

Biblioteca TypeScript para leitura e validação de arquivos de remessa CNAB 240 e CNAB 400 (boletos bancários).

## Funcionalidades

- Detecção automática de banco, formato (CNAB 240 ou CNAB 400) e quantidade de boletos, a partir do próprio conteúdo do arquivo
- Validação do arquivo inteiro (tamanho e início de linha, campos de cada boleto)
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

Por padrão a validação para no primeiro erro encontrado. Para coletar todos os erros do arquivo em vez de parar no primeiro, passe `true`:

```ts
const resultado = cnabFile.validate(true)
```

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
