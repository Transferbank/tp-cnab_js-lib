# @transferhub/cnab-lib-ts

Biblioteca TypeScript para leitura e validação de arquivos de remessa CNAB 240 e CNAB 400 (boletos bancários).

## Funcionalidades

- Detecção automática de banco, formato (CNAB 240 ou CNAB 400) e quantidade de boletos, a partir do próprio conteúdo do arquivo
- Validação do arquivo inteiro (tamanho e início de linha, campos de cada boleto)
- Leitura dos boletos, com os valores dos campos já convertidos (texto, número e data)
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

## Campos de boleto

Cada campo é identificado por uma chave (`fieldKey`), usada nos erros de validação e na leitura dos boletos.

| Chave                 | Descrição                       | Tipo     |
| --------------------- | ------------------------------- | -------- |
| `nome_do_sacado`      | Nome do sacado                  | `string` |
| `documento_do_sacado` | Documento (CPF/CNPJ) do sacado  | `string` |
| `data_de_vencimento`  | Data de vencimento              | `Date`   |
| `valor_do_titulo`     | Valor do título, em reais       | `number` |
| `endereco_do_sacado`  | Endereço do sacado              | `string` |
| `bairro_do_sacado`    | Bairro do sacado                | `string` |
| `cep_do_sacado`       | CEP do sacado                   | `string` |
| `cidade_do_sacado`    | Cidade do sacado                | `string` |
| `uf_do_sacado`        | UF do sacado                    | `string` |

Todos os campos são validados e lidos em todos os bancos acima, exceto quando o layout do banco não tem o campo:

- Bradesco CNAB 400: sem bairro, cidade e UF
- Sicredi CNAB 240: sem bairro
- Sicredi CNAB 400: sem bairro, cidade e UF

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

### Lendo os boletos

`read()` valida o arquivo e devolve um `Cnab` com a lista de boletos. Cada `CnabBoleto` traz em `fields` os valores dos campos preenchidos, indexados pela chave do campo:

```ts
const cnab = cnabFile.read()

for (const boleto of cnab.boletos) {
  boleto.fields.nome_do_sacado // ex: 'JOAO EXEMPLO SILVA'
  boleto.fields.valor_do_titulo // ex: 10000
  boleto.fields.data_de_vencimento // ex: Date(2026-12-15)
}
```

Campos vazios no arquivo não aparecem em `fields`.

### Tratando erros de validação

Todo erro implementa `CnabValidationError`, com `errorType` (`'line'`, `'field'` ou `'group'`), `lineNumber` (começando em 0) e `message`. Erros de campo (`CnabFieldValidationError`) também trazem `fieldKey`, `fieldLabel` (ex: `'Nome do sacado'`) e `range`.

```ts
import { CnabFieldValidationError } from '@transferhub/cnab-lib-ts'

for (const error of result.errors) {
  if (error instanceof CnabFieldValidationError) {
    console.log(error.fieldKey, error.fieldLabel, error.message)
  }
}
```

#### Composição dos boletos (CNAB 240)

Além de validar cada linha, a lib confere se cada boleto tem os segmentos certos. Esses erros têm `errorType: 'group'`, estendem `CnabGroupValidationError` e trazem `segmentName` (ex: `'segmento Q'`). O `lineNumber` de cada erro é a linha do arquivo onde o problema é apontado:

| Erro | Quando | Linha apontada pelo erro (`lineNumber`) |
| ---- | ------ | --------------------------------------- |
| `CnabGroupMissingSegmentError` | boleto de entrada de títulos (movimento `01` no segmento P) sem segmento Q | segmento P do boleto |
| `CnabGroupDuplicateSegmentError` | segmento R mais de uma vez no mesmo boleto | segunda ocorrência |
| `CnabGroupMissingStartSegmentError` | segmento Q a mais no boleto, indicando um boleto que perdeu o segmento P | o segmento Q a mais |
| `CnabGroupSegmentOutOfOrderError` | segmento Q que não vem logo depois do segmento P | o segmento Q |

Em instruções e alterações (outros códigos de movimento), o segmento Q é opcional. Os segmentos opcionais (R, S, Y) podem vir em qualquer ordem depois do Q.

### Exceções

Problemas que impedem o processamento do arquivo lançam exceções que estendem `CnabException`:

| Exceção                               | Quando                                            |
| ------------------------------------- | ------------------------------------------------- |
| `CnabMinimumLinesNotReachedException` | O arquivo tem menos de 3 linhas                   |
| `CnabFormatNotRecognizedException`    | A primeira linha não tem 240 nem 400 caracteres   |
| `CnabBankCodeNotFoundException`       | O código do banco no header não é reconhecido     |
| `CnabBankSchemaNotFoundException`     | O banco não tem suporte para o formato do arquivo |
| `CnabInvalidFileException`            | `read()` em um arquivo que não passa na validação |
