# Guia de Retornos — CNAB-Lib

Este documento explica exatamente **o que cada método devolve** e como consumir esse
retorno. Para instalação e um exemplo mínimo de uso, veja [README.md](README.md).

## Visão geral

| Chamada | Devolve | Lança exceção? |
|---|---|---|
| `openCnab(raw)` | `CNABFile` | Sim — erros de setup (arquivo/formato/banco/schema) |
| `cnabFile.validate()` | `CNABFileValidationResult` | Não para erros de conteúdo — eles vêm dentro do próprio retorno |
| `cnabFile.read(options?)` | `CNABReadResult<T>` | Sim — erros de agrupamento/extração (exceto no boleto individual em modo `lazy`) |
| `cnabFile.readAsync(options?)` | `Promise<CNABReadResult<T>>` | Mesma regra de `read()`, mas via rejeição da Promise |

O formato de `T` em `bills` muda conforme `mode`/`lazy` — ver seção 3.

## 1. Erros lançados por `openCnab()`

Todos estendem `CNABError` (têm `.code` e `.message`) e podem ser distinguidos por `instanceof`:

| Classe | `code` | Campos extras | Quando acontece |
|---|---|---|---|
| `CNABEmptyFileError` | `EMPTY_FILE` | — | Arquivo vazio ou só linhas em branco |
| `CNABFormatNotRecognizedError` | `FORMAT_NOT_RECOGNIZED` | `lineLength: number` | Primeira linha não tem 240 nem 400 caracteres |
| `CNABBankNotFoundError` | `BANK_NOT_FOUND` | `format: 'cnab240' \| 'cnab400'` | Código do banco não encontrado no header |
| `CNABSchemaNotFoundError` | `SCHEMA_NOT_FOUND` | `bankCode: string`, `format` | Banco identificado, mas sem schema cadastrado |

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

## 2. `cnabFile.validate()` → `CNABFileValidationResult`

```typescript
{
  isValid: boolean          // true somente se feedback.lines estiver vazio
  feedback: {
    type: 'CNAB 240' | 'CNAB 400'
    bank: string             // nome do banco, ex: 'Bradesco'
    lines: ValidationError[] // erros de estrutura + negócio, já mesclados
  }
}
```

`ValidationError` é `{ line: number; column: string; message: string }` — `column` é o nome do
campo (ex: `'Data de vencimento'`) ou um rótulo genérico (`'Estrutura'`) quando o problema não é
de um campo específico.

```typescript
const validation = cnabFile.validate()

if (!validation.isValid) {
  validation.feedback.lines.forEach(({ line, column, message }) => {
    console.log(`Linha ${line} — ${column}: ${message}`)
  })
}
```

**Não tem** `records`/`totalRecords` — esses dois campos existem só no retorno legado de
`validateCnabFile()`. Se você precisa de uma lista achatada de boletos para exibir em tela, monte
a partir de `.read()` (seção 5).

## 3. `cnabFile.read()` / `.readAsync()` → `CNABReadResult<T>`

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
| `{ lazy: true }` (com qualquer `mode`) | `LazyBillItem<T>` — item ainda não extraído, ver seção 4 |

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

## 4. Modo lazy: `LazyBillItem<T>`

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

## 5. Montando uma lista achatada (para tabela/UI)

Se seu projeto precisa de algo parecido com o antigo `records` de `validateCnabFile()`, monte a
partir de `.read()`:

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

## Ver também

- [README.md](README.md) — instalação e uso básico
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) — adicionar um novo banco
