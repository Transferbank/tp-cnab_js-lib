# @transferhub/cnab-lib-ts

Biblioteca TypeScript para **leitura, detecção e validação** de arquivos de remessa
**CNAB 240** e **CNAB 400** (cobrança / boleto) no padrão FEBRABAN.

- Detecção automática de **banco**, **formato** e **quantidade de boletos**, a partir do próprio conteúdo do arquivo
- Validação do arquivo inteiro (tamanho e início de linha, campos de cada boleto)
- Leitura estruturada do arquivo (`read()`) para um objeto de domínio com header, boletos e trailer
- Erros de validação tipados, com linha, campo e mensagem
- Sem dependências de runtime; tipagem estrita; funciona em Node e no browser
- Suporte a **7 bancos**, em CNAB 240 e CNAB 400

## Bancos suportados

| Banco                   | Código | CNAB 240 | CNAB 400 |
| ----------------------- | :----: | :------: | :------: |
| Banco do Brasil         |  001   |    ✅    |    ✅    |
| Santander               |  033   |    ✅    |    ✅    |
| Caixa Econômica Federal |  104   |    ✅    |    ✅    |
| Itaú                    |  341   |    ✅    |    ✅    |
| Bradesco                |  237   |    ✅    |    ✅    |
| Sicredi                 |  748   |    ✅    |    ✅    |
| Sicoob                  |  756   |    ✅    |    ✅    |

Campos de boleto lidos/validados hoje, para todos os bancos acima: nome do sacado, data de vencimento, valor do título e documento (CPF/CNPJ) do sacado.

## Instalação

```bash
npm install @transferhub/cnab-lib-ts
# ou
yarn add @transferhub/cnab-lib-ts
```

Requer Node.js 18+ (usa `TextDecoder` e a Web File API, disponíveis globalmente a
partir dessa versão).

## Uso

### Abrindo um arquivo CNAB

A partir de um `File` (browser ou Node 20+):

```ts
import { openCnabFile } from '@transferhub/cnab-lib-ts'

const cnabFile = await openCnabFile(file) // file: File
```

A partir das linhas já lidas (Node):

```ts
import { readFileSync } from 'node:fs'
import { openCnabFileFromLines } from '@transferhub/cnab-lib-ts'

// arquivos CNAB usam codificação latin1 (ISO-8859-1)
const content = readFileSync('remessa.rem', 'latin1')
const lines = content.split(/\r?\n/).filter((l) => l.length > 0)

const cnabFile = openCnabFileFromLines(lines)
```

Depois de aberto, o `CnabFile` já expõe o banco, o formato e a quantidade de boletos detectados:

```ts
cnabFile.bank // ex: 'itau'
cnabFile.format // ex: '240'
cnabFile.boletoCount // ex: 3
```


### Validando o arquivo inteiro

```ts
const result = cnabFile.validate()

result.isValid // true | false
result.errors  // lista de erros encontrados (vazia se válido)
```

Por padrão `validate()` para no primeiro erro encontrado. Para coletar todos os erros do arquivo em vez de parar no primeiro, passe `true`:

```ts
const result = cnabFile.validate(true)
```

### Lendo o arquivo

`read()` valida o arquivo inteiro e, se ele for válido, retorna um objeto `Cnab` com o header, o trailer e os boletos já estruturados. Se o arquivo for inválido, lança `CnabValidationFailedException` em vez de retornar dados parciais:

```ts
import { CnabValidationFailedException } from '@transferhub/cnab-lib-ts'

try {
  const cnab = cnabFile.read()

  console.log(cnab.boletos.length)
  console.log(cnab.boletos[0]['nome do sacado'])      // acesso dinâmico por nome de campo
  console.log(cnab.boletos[0]['valor do título'])
  console.log(cnab.boletos[0]['data de vencimento'])
} catch (error) {
  if (error instanceof CnabValidationFailedException) {
    console.log(error.errors) // CnabValidationError[]
  }
}
```

Cada boleto (`CnabBoleto`) e cada linha (`CnabLineData`) expõe os campos dinamicamente via Proxy — `boleto['nome do campo']` busca automaticamente na primeira linha do boleto que o declara. Acessar um campo que não existe lança erro (`Campo desconhecido: '...'`); os objetos são somente leitura. Além do acesso dinâmico, `CnabLineData` também tem `getField()`, `get()`, `fields`, `fieldNames`, `hasField()` e `toJSON()` para uso tipado.

### Validar campos adicionais

É possível injetar classes de campo próprias para validar (ou ler) outras posições da linha, além das que a biblioteca já verifica — funciona tanto em `validate()` quanto em `read()`:

```ts
import { openCnabFileFromLines, CnabField, CnabFieldType } from '@transferhub/cnab-lib-ts'

class MeuNossoNumeroField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nosso numero'
  readonly range: [number, number] = [38, 57]
  // ...performValidation() / parseValue()
}

cnabFile.validate(true, [MeuNossoNumeroField])
cnabFile.read([MeuNossoNumeroField])
```

### Tratando erros de validação

Todo erro implementa `CnabValidationError`, com `errorType` (`'line'` ou `'field'`), `lineNumber` e `message`. Erros de campo (`CnabFieldValidationError`) também trazem `fieldName` e `range`.

```ts
import { CnabFieldValidationError } from '@transferhub/cnab-lib-ts'

for (const error of result.errors) {
  if (error instanceof CnabFieldValidationError) {
    console.log(error.fieldName, error.message)
  }
}
```

## API

### `openCnabFile(file: File): Promise<CnabFile>`

Lê o `File`, decodifica como latin1, quebra em linhas e detecta banco/formato.

### `openCnabFileFromLines(lines: string[]): CnabFile`

Mesma detecção, a partir de um array de linhas já lido. Lança
`CnabMinimumLinesNotReachedException` se houver menos de 3 linhas.

### `CnabFile`

| Membro                                   | Descrição                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `bank: CnabBank`                          | Banco detectado (`'itau'`, `'caixa'`, …)                                 |
| `format: CnabFormat`                      | `'240'` ou `'400'`                                                       |
| `rawLines: string[]`                      | Linhas originais do arquivo                                              |
| `boletoCount: number`                     | Quantidade de boletos, calculada uma vez na abertura                     |
| `validate(withFeedback?, extraFields?)`   | Valida o arquivo inteiro e retorna `CnabValidationResult`                |
| `read(extraFields?)`                      | Valida e retorna um `Cnab` estruturado; lança `CnabValidationFailedException` se inválido |

### `CnabValidationResult`

```ts
interface CnabValidationResult {
  isValid: boolean
  errors: CnabValidationError[]
}
```

Cada `CnabValidationError` expõe `lineNumber`, `errorType` (`'line'` | `'field'`) e
`message`. Erros de campo (`CnabFieldValidationError`) também trazem `fieldName` e
`range`. Subclasses concretas exportadas: `CnabInvalidLineSizeError`,
`CnabInvalidLineStartError`, `CnabFieldMinLengthError`, `CnabGenericFieldError`,
`CnabFieldParseError` (e as subclasses `CnabFieldInvalidNumberError`/`CnabFieldInvalidDateError`).

### Exceções

Lançadas antes de qualquer validação de boleto rodar (todas estendem `CnabException`):
`CnabMinimumLinesNotReachedException`, `CnabFormatNotRecognizedException`,
`CnabBankCodeNotFoundException`, `CnabBankSchemaNotFoundException`.

Lançada por `read()` quando o arquivo é inválido: `CnabValidationFailedException`
(expõe `.errors: CnabValidationError[]`).

### Utilitários

```ts
import { validateDocument, parseDateDDMMAAAA, formatDateBR } from '@transferhub/cnab-lib-ts'

validateDocument('00011122233396')       // valida CPF/CNPJ (módulo 11)
parseDateDDMMAAAA('15122026')            // Date
formatDateBR(new Date())                 // '08/09/2026'
```

## O que é validado hoje

| Registro                | Verificações                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| Todas as linhas         | Tamanho exato (240 ou 400 caracteres)                            |
| Header / trailer (400)  | Caractere inicial do registro                                    |
| Linhas de boleto        | Nome, documento, valor e vencimento do sacado — formato e tamanho |

No CNAB 240 as linhas de boleto são agrupadas a partir do Segmento P
(posição 8 = `3`, posição 14 = `P`); no CNAB 400, a partir do registro de detalhe.

## Limitações

- A validação cobre os campos do sacado; não valida somatórios de trailer,
  sequência de registros nem dígitos verificadores de nosso número.

## Estrutura

```
src/cnab/
  type/        modelos e contratos (CnabFile, CnabSchema, CnabLineData, erros, …)
  field/       classes base de campo compartilhadas entre bancos (CNAB 240/400)
  bank/        um diretório por banco: campos (finos, herdando da base), group rule e docs de layout
  validators/  validadores de linha (tamanho, início de registro)
  utils/       parsing de data e de documento (CPF/CNPJ)
test/          espelha a árvore de src/
res/           arquivos CNAB de exemplo (dados fictícios) usados nos testes
```

## Licença

MIT
