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
| Bradesco                |    ✅    |    ✅    |
| Caixa Econômica Federal |    ✅    |    ✅    |
| Itaú                    |    ✅    |    ✅    |
| Santander               |    ✅    |    ✅    |
| Sicoob                  |    ✅    |    ✅    |
| Sicredi                 |    ✅    |    ✅    |

- ✅ Suportado: o arquivo é validado e lido.
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

### Campos que o layout não tem

Alguns layouts não têm todos os campos acima. Nesses casos, o campo não é lido e não aparece em `fields`:

| Banco e formato   | Campos que o layout não tem |
| ----------------- | --------------------------- |
| Bradesco CNAB 400 | bairro, cidade e UF         |
| Sicredi CNAB 240  | bairro                      |
| Sicredi CNAB 400  | bairro, cidade e UF         |

Os campos lidos em cada banco e formato estão declarados em [`cnab-bank-schemas.ts`](src/cnab/bank/cnab-bank-schemas.ts).

### Campos obrigatórios e opcionais

Os campos que o layout tem são **obrigatórios**: um campo vazio no arquivo é erro de validação, inclusive quando o manual do banco não diz se o campo é obrigatório.

A exceção são os campos que o manual do banco declara **opcionais**, que podem vir vazios:

- Caixa CNAB 240: endereço, bairro, CEP, cidade e UF (notas G032 a G036 do manual, opcionais quando a emissão e a entrega do boleto são feitas pelo beneficiário)

### Campos de contato

Além dos campos acima, a lib lê o contato do pagador nos layouts que o trazem. Esses campos são **opcionais**: nos layouts sem eles, e quando vêm vazios (ou preenchidos só com zeros, no DDD e no celular), eles não aparecem em `fields`. Um campo preenchido com conteúdo inválido continua sendo erro de validação.

| Banco           | Formato  | E-mail | DDD e celular |
| --------------- | :------: | :----: | :-----------: |
| Banco do Brasil | CNAB 240 |   ✅   |      ✅       |
| Banco do Brasil | CNAB 400 |   ✅   |               |
| Bradesco        | CNAB 240 |   ✅   |      ✅       |
| Caixa           | CNAB 240 |   ✅   |      ✅       |
| Caixa           | CNAB 400 |   ✅   |      ✅       |
| Itaú            | CNAB 400 |   ✅   |               |

| Chave               | Descrição                                    | Tipo       |
| ------------------- | -------------------------------------------- | ---------- |
| `email_do_sacado`   | E-mails do sacado                            | `string[]` |
| `ddd_do_sacado`     | DDD do celular do sacado                     | `string`   |
| `celular_do_sacado` | Número do celular do sacado (8 ou 9 dígitos) | `string`   |

`email_do_sacado` é sempre uma lista. Só o Banco do Brasil aceita mais de um e-mail, separados por `;` e sem espaços, como pede o manual do banco. Nos demais, a lista tem um único e-mail, e um `;` no campo é erro de validação.

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

Todo erro implementa `CnabValidationError`, com `errorType` (`'line'` ou `'field'`), `lineNumber` (começando em 0) e `message`. Erros de campo (`CnabFieldValidationError`) também trazem `fieldKey`, `fieldLabel` (ex: `'Nome do sacado'`) e `range`.

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
