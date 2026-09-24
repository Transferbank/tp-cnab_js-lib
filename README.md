# @transferhub/cnab-lib-ts

Biblioteca TypeScript para leitura e validação de arquivos de remessa CNAB 240 e CNAB 400 (boletos bancários).

## Funcionalidades

- Detecção automática de banco e formato (CNAB 240 ou CNAB 400) a partir do próprio conteúdo do arquivo
- Validação do arquivo inteiro (tamanho e início de linha, campos de cada boleto)
- Validação individual de cada boleto dentro do arquivo, permitindo saber exatamente quais boletos são válidos e quais não, e por quê
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

_(em breve)_

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

Depois de aberto, o `CnabFile` já expõe o banco e o formato detectados:

```ts
cnabFile.bank // ex: 'bradesco'
cnabFile.format // ex: '240'
```

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

### Validando boleto a boleto

Quando o arquivo tem vários boletos, `validate()` só diz se o arquivo inteiro está ok ou não. Para saber **quais** boletos são válidos e quais não, use `validateBoletos()`:

```ts
const resultados = cnabFile.validateBoletos(true)

for (const boleto of resultados) {
  console.log(
    `Boleto ${boleto.index} (linhas ${boleto.lineNumbers.join(', ')}): ${
      boleto.isValid ? 'válido' : 'inválido'
    }`
  )
  boleto.errors.forEach(erro => console.log(`  - ${erro.message}`))
}
```

Cada boleto do arquivo é avaliado individualmente e de forma independente: um boleto inválido não afeta a avaliação dos demais, e todos os boletos são sempre analisados, mesmo que o arquivo como um todo seja inválido.

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
