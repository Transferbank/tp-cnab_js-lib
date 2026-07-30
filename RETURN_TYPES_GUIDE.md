# Guia de Retornos — CNAB-Lib

Este documento explica exatamente **o que cada método devolve** e como consumir esse
retorno. Para instalação e um exemplo mínimo de uso, veja [README.md](README.md).

## Visão geral

| Chamada | Devolve | Lança exceção? |
|---|---|---|
| `openCnab(raw)` | `CNABFile` | Sim — erros de setup (arquivo/formato/banco/schema) |
| `cnabFile.validate(withFeedback?)` | `CNABValidationResult` | Não para erros de conteúdo — eles vêm dentro do próprio retorno. Pode lançar `CNABInternalInconsistencyError` (bug interno, raro) |
| `cnabFile.read(options?)` | `CNABReadResult<T>` | Sim — erros de agrupamento/extração (exceto no boleto individual em modo `lazy`) |
| `cnabFile.readAsync(options?)` | `Promise<CNABReadResult<T>>` | Mesma regra de `read()`, mas via rejeição da Promise |

O formato de `T` em `bills` muda conforme `mode`/`lazy` — ver seção 3.

## 1. Erros lançados por `openCnab()`

Todos estendem `CNABError` (têm `.code` e `.message`) e podem ser distinguidos por `instanceof`:

| Classe | `code` | Campos extras | Quando acontece |
|---|---|---|---|
| `CNABEmptyFileError` | `EMPTY_FILE` | — | `raw` é `null`/`undefined`, ou vira 0 linhas após split (arquivo vazio ou só linhas em branco) |
| `CNABFormatNotRecognizedError` | `FORMAT_NOT_RECOGNIZED` | `lineLength: number` | Primeira linha não tem 240 nem 400 caracteres |
| `CNABBankNotFoundError` | `BANK_NOT_FOUND` | `format: CNABFormatCode` (`'CNAB240'` \| `'CNAB400'`) | Código do banco não encontrado no header |
| `CNABSchemaNotFoundError` | `SCHEMA_NOT_FOUND` | `bankCode: string`, `format: CNABFormatCode` | Banco identificado, mas sem schema cadastrado |

```typescript
try {
  const cnabFile = openCnab(fileContent)
} catch (error) {
  if (error instanceof CNABBankNotFoundError) {
    console.error(`Banco não encontrado no header (formato ${error.format})`)
  } else {
    console.error(error.code, error.message)
  }
}
```

Duas outras classes de erro de input existem na hierarquia (`CNABNoLinesProvidedError`,
`CNABInvalidHeaderError`) mas hoje não são alcançáveis por `openCnab()` — `openCnab()` já garante
"pelo menos uma linha" e "header não vazio" antes de chamar as funções internas que as lançariam.
Elas ficam exportadas por completude da hierarquia de erros.

## 2. `cnabFile.validate(withFeedback?)` → `CNABValidationResult`

```typescript
{
  isValid: boolean          // true somente se feedback.lines estiver vazio
  feedback: {
    type: 'CNAB 240' | 'CNAB 400'
    bank: string             // nome do banco, ex: 'Bradesco'
    lines: ValidationError[] // erros de estrutura + negócio, já mesclados
    records?: CNABRecord[]   // só presente quando withFeedback === true — ver abaixo
  }
}
```

`ValidationError` é `{ line: number; field: string; message: string }` — `field` é o nome do
campo (ex: `'Data de vencimento'`) ou um rótulo genérico (`'Estrutura'`) quando o problema não é
de um campo específico.

### `withFeedback` — dois modos de validação

`validate()` tem um único parâmetro booleano, `withFeedback` (padrão `false`), que muda
completamente a estratégia:

| `withFeedback` | Modo | Comportamento |
|---|---|---|
| `false` (padrão) | **fail-fast** | Para na estrutura ou no conteúdo assim que encontra o **primeiro** erro. `feedback.lines` tem no máximo 1 item. Mais rápido quando o arquivo tem erro cedo; se o arquivo for válido, ainda percorre tudo (não há erro pra parar). Conteúdo só é validado se a estrutura passar limpa — evita gastar tempo validando campos de um arquivo estruturalmente quebrado. |
| `true` | **full feedback** | Roda estrutura **e** conteúdo por completo, reporta **todos** os erros encontrados (`feedback.lines` pode ter vários itens), e popula `feedback.records: CNABRecord[]` — uma linha por título de detalhe processado, com `{ name, amount, dueDate, address, document }`. |

```typescript
// fail-fast — resposta rápida, só o primeiro problema
const quick = cnabFile.validate()

// full feedback — todos os erros + lista de registros
const full = cnabFile.validate(true)

if (!full.isValid) {
  full.feedback.lines.forEach(({ line, field, message }) => {
    console.log(`Linha ${line} — ${field}: ${message}`)
  })
}

full.feedback.records?.forEach((r) => console.log(r.name, r.amount, r.dueDate))
```

Use fail-fast (`false`) para checagem rápida de "esse arquivo está ok?" antes de processar. Use
`true` quando quiser mostrar uma lista completa de problemas pro usuário final, ou quando quiser a
lista de registros já pronta pra exibir em tela sem chamar `.read()` separadamente.

## 3. Outros métodos e propriedades de `CNABFile`

Além de `validate()`/`read()`/`readAsync()`, a instância devolvida por `openCnab()` expõe:

| Membro | Tipo | Descrição |
|---|---|---|
| `.type` | `CNABFormatCode` | `'CNAB240'` ou `'CNAB400'`, formato detectado |
| `.bankCode` | `string` | Código do banco (ex: `'237'`) |
| `.bankName` | `string` | Nome do banco (ex: `'Bradesco'`) |
| `.lineCount` | `number` | Total de linhas do arquivo, incluindo header e trailer |
| `.getLines()` | `readonly string[]` | Linhas brutas do arquivo, sem modificação |
| `.toString()` | `string` | Resumo legível: `"CNABFile { type: CNAB 240, bank: Bradesco (237), lines: 42 }"` |

```typescript
const cnabFile = openCnab(fileContent)

console.log(cnabFile.bankName, cnabFile.type, cnabFile.lineCount)
```

## 4. `cnabFile.read()` / `.readAsync()` → `CNABReadResult<T>`

```typescript
{
  header: CNABHeader
  trailer: CNABTrailer
  bills: T[]  // formato de T depende de options — ver tabela abaixo
}
```

**`header` (`CNABHeader`)**
```typescript
{ cedente: { nome?: string; documento?: string }, dataGeracao?: string /* DD/MM/AAAA */ }
```

**`trailer` (`CNABTrailer`)** — a maioria dos bancos não expõe muito aqui:
```typescript
{ quantidadeRegistros?: number; quantidadeLotes?: number /* só CNAB 240 */; valorTotal?: number /* só alguns bancos */ }
```

**`bills`** — o formato de cada item depende das `options` passadas para `read()`/`readAsync()`:

| `options` | Tipo de cada item em `bills` |
|---|---|
| (nenhuma) ou `{ mode: 'SIMPLE' }` | `CNABData` — campos canônicos, iguais entre bancos |
| `{ mode: 'FULL' }` | `Record<string, unknown>` — todos os campos brutos do schema daquele banco |
| `{ lazy: true }` (com qualquer `mode`) | `LazyBillItem<T>` — item ainda não extraído, ver seção 5 |

`{ page: { start, size } }` pagina `bills` em qualquer combinação acima (útil para arquivos grandes).

**`CNABData`** (modo `SIMPLE`, o padrão) — **todo campo é opcional**: nem todo banco preenche
tudo, sempre use optional chaining:
```typescript
{
  valor?: number
  vencimento?: string        // DD/MM/AAAA
  dataEmissao?: string       // DD/MM/AAAA
  nossoNumero?: string
  numeroDocumento?: string
  sacado?: {
    nome?: string
    documento?: string       // CPF/CNPJ sem formatação
    endereco?: { logradouro?: string; bairro?: string; cep?: string; cidade?: string; estado?: string }
  }
  multa?: { tipo?: 'valor' | 'percentual' | 'dispensado'; valor?: number; vigenciaAPartirDe?: string }
  juros?: { tipo?: 'valor' | 'percentual' | 'dispensado'; valor?: number; vigenciaAPartirDe?: string }
  desconto?: { valor?: number; dataLimite?: string }
  abatimento?: { valor?: number }
}
```

```typescript
const { header, trailer, bills } = cnabFile.read()

console.log(`Cedente: ${header.cedente.nome}`)
bills.forEach((bill) => {
  console.log(bill.sacado?.nome ?? '(sem nome)', bill.valor, bill.vencimento)
})
```

Exceções que `read()`/`readAsync()` podem lançar (modo eager): `CNABGroupingError` (linhas não
formam um boleto válido — ex: segmento Q sem P correspondente) e `CNABUnknownFieldCodeError`
(código de campo não reconhecido durante extração). `CNABInternalInconsistencyError` também pode
ocorrer, mas indica bug na lib, não erro de input.

### `readAsync()` — opções extras

Além de tudo que `ReadOptions` aceita, `readAsync()` aceita:

```typescript
interface ReadAsyncOptions extends ReadOptions {
  onProgress?: (progress: { current: number; total: number }) => void
  batchSize?: number  // padrão 100 — de quantos em quantos boletos o progresso é reportado
}
```

`onProgress` é chamado a cada `batchSize` boletos processados (e uma vez no final, se o total não
for múltiplo de `batchSize`), com um `await` de um tick (`setTimeout(..., 0)`) entre chamadas —
não bloqueia a *thread* principal por todo o processamento de uma vez.

```typescript
const { bills } = await cnabFile.readAsync({
  batchSize: 500,
  onProgress: ({ current, total }) => console.log(`${current}/${total}`),
})
```

## 5. Modo lazy: `LazyBillItem<T>`

Com `{ lazy: true }`, `bills` vem como `LazyBillItem<T>[]` em vez de `T[]` — nada é extraído até
você chamar `resolve()`:

```typescript
interface LazyBillItem<T> {
  startLine: number        // linha física (1-indexed) onde o boleto começa no arquivo
  resolve: () => Promise<T>
}
```

```typescript
const { bills } = cnabFile.read({ lazy: true })

const primeiro = await bills[0].resolve()  // extrai só esse boleto, sob demanda
```

Sem cache — chamar `resolve()` duas vezes reprocessa a mesma linha. Se a extração falhar,
`resolve()` rejeita com:
- a **mesma instância** do `CNABError` original (ex: `CNABUnknownFieldCodeError`), sem embrulho; ou
- um novo `CNABLazyResolveError` (`code: 'LAZY_RESOLVE_FAILED'`, campos `startLine`/`cause`)
  envolvendo qualquer outro erro inesperado.

## 6. Montando uma lista achatada (para tabela/UI)

Se você já chama `validate(true)`, a lista de registros vem pronta em `feedback.records` (seção 2)
— não precisa montar nada na mão. Se você só chama `.read()` e quer o mesmo formato achatado:

```typescript
const { bills } = cnabFile.read()

const records = bills.map((bill) => ({
  name: bill.sacado?.nome ?? '—',
  amount: bill.valor ?? 0,
  dueDate: bill.vencimento ?? '—',
  address: bill.sacado?.endereco?.logradouro ?? '—',
  document: bill.sacado?.documento ?? '—',
}))
```

## Hierarquia completa de erros

Todas as classes abaixo estendem `CNABError` (`code: string`, `message: string`), que por sua vez
tem duas subclasses abstratas: `CNABInputError` (input do consumidor) e `CNABInternalError` (bug
interno da lib — reportar como issue se aparecer).

| Classe | Base | `code` | Origem |
|---|---|---|---|
| `CNABEmptyFileError` | `CNABInputError` | `EMPTY_FILE` | `openCnab()` |
| `CNABFormatNotRecognizedError` | `CNABInputError` | `FORMAT_NOT_RECOGNIZED` | `openCnab()` |
| `CNABBankNotFoundError` | `CNABInputError` | `BANK_NOT_FOUND` | `openCnab()` |
| `CNABSchemaNotFoundError` | `CNABInputError` | `SCHEMA_NOT_FOUND` | `openCnab()` |
| `CNABNoLinesProvidedError` | `CNABInputError` | `NO_LINES_PROVIDED` | interno (não alcançável via `openCnab()` hoje) |
| `CNABInvalidHeaderError` | `CNABInputError` | `INVALID_HEADER` | interno (não alcançável via `openCnab()` hoje) |
| `CNABGroupingError` | `CNABInputError` | `GROUPING_ERROR` | `read()` / `readAsync()` |
| `CNABUnknownFieldCodeError` | `CNABInputError` | `UNKNOWN_FIELD_CODE` | `read()` / `readAsync()` / `resolve()` |
| `CNABInternalInconsistencyError` | `CNABInternalError` | `INTERNAL_INCONSISTENCY` | `validate()` / `read()` / `readAsync()` |
| `CNABLazyResolveError` | `CNABError` | `LAZY_RESOLVE_FAILED` | `LazyBillItem.resolve()` |

## Ver também

- [README.md](README.md) — instalação e uso básico
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) — adicionar um novo banco
