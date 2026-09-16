# @transferbank/cnab-lib-ts

[![npm version](https://img.shields.io/npm/v/@transferbank/cnab-lib-ts.svg)](https://www.npmjs.com/package/@transferbank/cnab-lib-ts)

Biblioteca TypeScript para **leitura, detecção e validação** de arquivos de remessa
**CNAB 240** e **CNAB 400** (cobrança / boleto) no padrão FEBRABAN.

- Detecção automática de **banco** e **formato** pela primeira linha do arquivo
- Validação de **tamanho de linha**, **tipo de registro** e dos **campos do sacado**
  (nome, documento, valor do título e vencimento)
- Suporte a **7 bancos** 
- Sem dependências de runtime; tipagem estrita; funciona em Node e no browser

> **Status:** validação, detecção e leitura (`CnabFile.read()`) estão prontas
> e cobertas por testes.

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

### Lendo os dados do boleto (`read()`)

`read()` valida o arquivo primeiro (para no primeiro erro) e, se estiver tudo
certo, devolve um objeto `Cnab` com `header`, `trailer` e um `CnabBoleto[]` —
já com os campos parseados para o tipo certo (`string`, `number`, `Date`...).
Se a validação falhar, lança `CnabValidationFailedException` (contém `errors`,
a mesma lista que `validate()` retornaria).

```ts
import { openCnabFileFromLines, CnabValidationFailedException } from '@transferbank/cnab-lib-ts'

const cnab = openCnabFileFromLines(linhas)

try {
  const dados = cnab.read()

  console.log(dados.boletos.length) // quantidade de boletos no arquivo

  const boleto = dados.boletos[0]
  console.log(boleto['nome do sacado'])      // 'JOAO EXEMPLO SILVA'
  console.log(boleto['valor do título'])     // 100 (number)
  console.log(boleto['data de vencimento'])  // Date
  console.log(boleto['documento do sacado']) // '000010000791989'
} catch (error) {
  if (error instanceof CnabValidationFailedException) {
    console.log(error.errors) // CnabValidationError[]
  }
}
```

**Acessando os campos:** o nome de cada campo é a mesma string usada em
`fieldName` na classe do campo (em português, com acentos e espaços — por
isso o acesso é `boleto['valor do título']`, não `boleto.valorDoTitulo`).
`CnabBoleto` e `CnabLineData` (`header`/`trailer`) funcionam da mesma forma:
são objetos somente-leitura (`Proxy`) que expõem cada campo válido para
aquela linha como uma propriedade dinâmica. Ler um campo que não existe
lança erro listando os campos disponíveis.

Formas alternativas de acessar, quando o nome do campo é dinâmico ou você
quer evitar o `throw` em campo inexistente:

```ts
boleto.hasField('valor do título')     // boolean
boleto.getField('valor do título')     // instância de CnabField, ou undefined
boleto.lineCount                       // quantas linhas (segmentos) o boleto tem
boleto.lines                           // CnabLineData[], uma por linha (segmento)

dados.header.get('...')                // mesma API em CnabLineData
dados.header.toJSON()                  // objeto plano, útil para serializar/logar
```

Cada linha de um boleto só expõe os campos que se aplicam **àquela linha**
(ex.: no CNAB 240, nome do sacado vem do segmento Q, valor e vencimento do
segmento P) — mas `CnabBoleto` já indexa todos os campos de todas as linhas
do boleto, então `boleto['nome do sacado']` funciona sem você precisar saber
em qual segmento/linha o campo mora.

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
| `read(extraFields?)`                              | Valida e retorna `Cnab` (`header`, `trailer`, `boletos`); lança `CnabValidationFailedException` se inválido |

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

### `Cnab`, `CnabBoleto`, `CnabLineData`

Retornados por `CnabFile.read()`.

| Tipo           | Membro                                    | Descrição                                          |
| -------------- | ------------------------------------------ | --------------------------------------------------- |
| `Cnab`         | `header`, `trailer: CnabLineData`          | Linha de header/trailer já parseada                  |
| `Cnab`         | `boletos: CnabBoleto[]`                    | Um item por boleto (grupo de linhas) no arquivo      |
| `CnabBoleto`   | `[fieldName]: unknown`                     | Acesso dinâmico ao valor de qualquer campo do boleto |
| `CnabBoleto`   | `lines: CnabLineData[]`                    | As linhas (segmentos) que compõem o boleto           |
| `CnabBoleto`   | `lineCount: number`                        | Quantidade de linhas do boleto                       |
| `CnabBoleto`   | `hasField(name): boolean`                  | Se algum campo do boleto tem esse nome               |
| `CnabLineData` | `[fieldName]: unknown`                     | Acesso dinâmico ao valor de um campo da linha        |
| `CnabLineData` | `rawLine: string`, `lineNumber: number`    | Linha original e número da linha no arquivo          |
| `CnabLineData` | `get<T>(name)`, `getField<T>(name)`        | Valor do campo, ou a instância de `CnabField`        |
| `CnabLineData` | `fields`, `fieldNames`, `hasField(name)`   | Introspecção dos campos disponíveis nessa linha      |
| `CnabLineData` | `toJSON()`                                 | Objeto plano `{ [fieldName]: valor, _meta }`         |

### Exceções

Lançadas pela detecção (todas estendem `CnabException`):
`CnabMinimumLinesNotReachedException`, `CnabFormatNotRecognizedException`,
`CnabBankCodeNotFoundException`, `CnabBankSchemaNotFoundException`. `read()`
lança `CnabValidationFailedException` (traz `errors: CnabValidationError[]`)
quando o arquivo não passa na validação.

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
