# @transferhub/cnab-lib-ts

Biblioteca TypeScript para leitura e validação de arquivos de remessa CNAB 240 e CNAB 400 (boletos bancários).

## Funcionalidades

- Detecção automática de banco, formato (CNAB 240 ou CNAB 400) e quantidade de boletos, a partir do próprio conteúdo do arquivo
- Validação do arquivo inteiro (tamanho e início de linha, campos de cada boleto)
- Erros de validação tipados, com linha, campo e mensagem
- Suporte a 7 bancos, em CNAB 240 e CNAB 400

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

const cnabFile = openCnabFileFromLines(lines) // string[]
```

Depois de aberto, o `CnabFile` já expõe o banco, o formato e a quantidade de boletos detectados:

```ts
cnabFile.bank // ex: 'bradesco'
cnabFile.format // ex: '240'
cnabFile.boletoCount // ex: 3
```


### Validando o arquivo inteiro

```ts
const result = cnabFile.validate()

result.isValid // true | false
result.errors // lista de erros encontrados (vazia se válido)
```

Por padrão a validação para no primeiro erro encontrado.
Passe `true` para feedback completo

```ts
const result = cnabFile.validate(true)
```

### Tratando erros de validação

Todo erro implementa `CnabValidationError`, com `errorType` (`'line'` ou `'field'`), `lineNumber` e `message`. Erros de campo (`CnabFieldValidationError`) também trazem `fieldKey` e `range`.

```ts
import { CnabFieldValidationError } from '@transferhub/cnab-lib-ts'

for (const error of result.errors) {
  if (error instanceof CnabFieldValidationError) {
    console.log(error.fieldKey, error.message)
  }
}
```
