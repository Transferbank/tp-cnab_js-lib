# @transferbank/cnab-lib-ts

Biblioteca TypeScript para **leitura, detecção e validação** de arquivos de remessa
**CNAB 240** e **CNAB 400** (cobrança / boleto) no padrão FEBRABAN.

- Detecção automática de **banco** e **formato** pela primeira linha do arquivo
- Validação de **tamanho de linha**, **tipo de registro** e dos **campos do sacado**
  (nome, documento, valor do título e vencimento)
- Suporte a **7 bancos** 
- Sem dependências de runtime; tipagem estrita; funciona em Node e no browser

> **Status:** validação e detecção estão prontas e cobertas por testes.
> O parsing completo do arquivo para um objeto de domínio (`CnabFile.read()`)
> ainda **não está implementado** — ver [Limitações](#limitações).

## Bancos suportados

| Banco            | Código | CNAB 240 | CNAB 400 |
| ---------------- | :----: | :------: | :------: |
| Banco do Brasil  |  001   |    ✅    |    ✅    |
| Santander        |  033   |    ✅    |    ✅    |
| Caixa Econômica  |  104   |    ✅    |    ✅    |
| Itaú             |  341   |    ✅    |    ✅    |
| Bradesco         |  237   |    ✅    |    ✅    |
| Sicredi          |  748   |    ✅    |    ✅    |
| Sicoob           |  756   |    ✅    |    ✅    |

## Instalação

```bash
npm install @transferbank/cnab-lib-ts
# ou
yarn add @transferbank/cnab-lib-ts
```

Requer Node.js 18+ (usa `TextDecoder` e a Web File API, disponíveis globalmente a
partir dessa versão).

## Uso

### A partir de um `File` (browser ou Node 20+)

```ts
import { openCnabFile } from '@transferbank/cnab-lib-ts'

const cnab = await openCnabFile(file) // file: File

console.log(cnab.bank)   // 'itau'
console.log(cnab.format) // '240'

const result = cnab.validate()
if (!result.isValid) {
  for (const error of result.errors) {
    console.log(`Linha ${error.lineNumber}: ${error.message}`)
  }
}
```

### A partir das linhas do arquivo (Node)

```ts
import { readFileSync } from 'node:fs'
import { openCnabFileFromLines } from '@transferbank/cnab-lib-ts'

// arquivos CNAB usam codificação latin1 (ISO-8859-1)
const conteudo = readFileSync('remessa.rem', 'latin1')
const linhas = conteudo.split(/\r?\n/).filter((l) => l.length > 0)

const cnab = openCnabFileFromLines(linhas)
const result = cnab.validate()

console.log(result.isValid)
```

### Feedback detalhado

Por padrão `validate()` para no primeiro erro. Passe `true` para coletar todos:

```ts
const result = cnab.validate(true)
```

### Validar campos adicionais

É possível injetar classes de campo próprias para validar outras posições da linha,
além das que a biblioteca já verifica:

```ts
import { openCnabFileFromLines, CnabField, CnabFieldType } from '@transferbank/cnab-lib-ts'

class MeuNossoNumeroField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nosso numero'
  readonly range: [number, number] = [38, 57]
  // ...performValidation() / parseValue()
}

cnab.validate(true, [MeuNossoNumeroField])
```

## API

### `openCnabFile(file: File): Promise<CnabFile>`

Lê o `File`, decodifica como latin1, quebra em linhas e detecta banco/formato.

### `openCnabFileFromLines(lines: string[]): CnabFile`

Mesma detecção, a partir de um array de linhas já lido. Lança
`CnabMinimumLinesNotReachedException` se houver menos de 3 linhas.

### `CnabFile`

| Membro                                            | Descrição                                                        |
| ------------------------------------------------- | --------------------------------------------------------------- |
| `bank: CnabBank`                                  | Banco detectado (`'itau'`, `'caixa'`, …)                       |
| `format: CnabFormat`                              | `'240'` ou `'400'`                                             |
| `rawLines: string[]`                              | Linhas originais do arquivo                                     |
| `validate(withFeedback?, extraFields?)`           | Valida o arquivo e retorna `CnabValidationResult`             |
| `read(extraFields?)`                              | **Ainda não implementado** — lança erro                        |

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
`CnabInvalidLineStartError`, `CnabFieldMinLengthError`, `CnabGenericFieldError`.

### Exceções

Lançadas pela detecção (todas estendem `CnabException`):
`CnabMinimumLinesNotReachedException`, `CnabFormatNotRecognizedException`,
`CnabBankCodeNotFoundException`, `CnabBankSchemaNotFoundException`.

### Utilitários

```ts
import { validateDocument, parseDateDDMMAAAA, formatDateBR } from '@transferbank/cnab-lib-ts'

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

- `CnabFile.read()` (montar um objeto de domínio com header, boletos e trailer)
  ainda não foi implementado.
- A validação cobre os campos do sacado; não valida somatórios de trailer,
  sequência de registros nem dígitos verificadores de nosso número.



Estrutura:

```
src/cnab/
  type/        modelos e contratos (CnabFile, CnabSchema, erros, …)
  bank/        um diretório por banco: campos, group rule e docs de layout
  validators/  validadores de linha (tamanho, início de registro)
  utils/       parsing de data e de documento (CPF/CNPJ)
test/          espelha a árvore de src/
res/           arquivos CNAB de exemplo (dados fictícios) usados nos testes
```

## Licença

MIT
