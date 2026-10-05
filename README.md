# @fx55/cnab-lib-ts

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
| Bradesco                |    ✅    |    ⚠️    |
| Caixa Econômica Federal |    ✅    |    ✅    |
| Itaú                    |    ✅    |    ✅    |
| Santander               |    ✅    |    ✅    |
| Sicoob                  |    ✅    |    ✅    |
| Sicredi                 |    ⚠️    |    ⚠️    |

- ✅ Suportado: o arquivo é validado e lido.
- ⚠️ Reconhecido, mas recusado: o layout do banco não tem todos os [campos essenciais](#campos-essenciais-e-opcionais), então a validação dá erro de layout e a leitura falha.
- ❌ Não reconhecido: bancos e formatos fora desta tabela. `openCnabFile` lança exceções para cada caso (veja [Exceções](#exceções)).

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

### Campos essenciais e opcionais

Todos os campos acima são **essenciais**: o layout do banco precisa ter cada um deles. Quando falta algum, o arquivo é recusado com um erro de layout (veja [Tratando erros de validação](#tratando-erros-de-validação)):

| Banco e formato   | Campos que o layout não tem |
| ----------------- | --------------------------- |
| Bradesco CNAB 400 | bairro, cidade e UF         |
| Sicredi CNAB 240  | bairro                      |
| Sicredi CNAB 400  | bairro, cidade e UF         |

Nos demais bancos, todos os campos são **obrigatórios**: um campo vazio no arquivo é erro de validação, inclusive quando o manual do banco não diz se o campo é obrigatório.

A exceção são os campos que o manual do banco declara **opcionais**, que podem vir vazios:

- Caixa CNAB 240: endereço, bairro, CEP, cidade e UF (notas G032 a G036 do manual, opcionais quando a emissão e a entrega do boleto são feitas pelo beneficiário)

## Instalação

```bash
npm install @fx55/cnab-lib-ts
```

ou

```bash
yarn add @fx55/cnab-lib-ts
```

Requer Node.js 18+ (usa a Web File API, disponível globalmente a partir dessa versão).

## Como usar

### Abrindo um arquivo CNAB

A partir de um `File` (por exemplo, um input de upload no navegador):

```ts
import { openCnabFile } from '@fx55/cnab-lib-ts'

const cnabFile = await openCnabFile(file)
```

A partir das linhas já lidas (por exemplo, um arquivo lido no backend):

```ts
import { openCnabFileFromLines } from '@fx55/cnab-lib-ts'

const cnabFile = openCnabFileFromLines(lines) // string[]
```

Depois de aberto, o `CnabFile` já expõe o banco, o formato e a quantidade de boletos detectados:

```ts
cnabFile.bank // ex: 'bradesco'
cnabFile.format // ex: '240'
cnabFile.boletoCount // ex: 3
cnabFile.missingEssentialFields // ex: [] ou ['bairro_do_sacado'] no Sicredi CNAB 240
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

Campos opcionais vazios no arquivo (como o endereço na Caixa CNAB 240) não aparecem em `fields`.

### Tratando erros de validação

Todo erro implementa `CnabValidationError`, com `errorType` (`'line'`, `'field'` ou `'layout'`), `lineNumber` (começando em 0) e `message`. Erros de campo (`CnabFieldValidationError`) também trazem `fieldKey`, `fieldLabel` (ex: `'Nome do sacado'`) e `range`.

Erros de layout (`CnabLayoutValidationError`) indicam que o layout do banco não serve para a lib, não importa o conteúdo do arquivo. Eles trazem `bank` e `format` e apontam para o header (`lineNumber` 0). Hoje o único é o `CnabMissingEssentialFieldError`, com o `fieldKey` do campo essencial que falta (ex: *"Layout CNAB240 do banco sicredi não possui o campo essencial bairro_do_sacado"*):

- `validate(true)`: um erro para cada campo que falta, seguido dos erros das linhas, que continuam sendo validadas
- `validate()`: só o primeiro campo que falta
- `read()`: lança `CnabInvalidFileException`

```ts
import { CnabFieldValidationError } from '@fx55/cnab-lib-ts'

for (const error of result.errors) {
  if (error instanceof CnabFieldValidationError) {
    console.log(error.fieldKey, error.fieldLabel, error.message)
  }
}
```

### Exceções

Problemas que impedem o processamento do arquivo lançam exceções que estendem `CnabException`:

| Exceção                               | Quando                                            |
| ------------------------------------- | ------------------------------------------------- |
| `CnabMinimumLinesNotReachedException` | O arquivo tem menos de 3 linhas                   |
| `CnabFormatNotRecognizedException`    | A primeira linha não tem 240 nem 400 caracteres   |
| `CnabBankCodeNotFoundException`       | O código do banco no header não é reconhecido     |
| `CnabBankSchemaNotFoundException`     | O banco não tem suporte para o formato do arquivo |
| `CnabInvalidFileException`            | `read()` em um arquivo que não passa na validação |
