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

Os campos do boleto são de dois tipos:

- **Canônicos:** lidos por padrão em toda leitura. Verificar o catálogo em [`cnab-bank-schemas.ts`](src/cnab/bank/cnab-bank-schemas.ts).
- **Extras:** lidos só quando passados em `validate` e `read`, no parâmetro `extraFields`. A lib oferece constantes prontas com campos extras, e quem usa a lib também pode escrever os seus (veja [Campos extras](#campos-extras)).

Cada campo é identificado por uma chave (`fieldKey`), usada nos erros de validação e na leitura dos boletos.

### Campos canônicos

| Chave                 | Descrição                      | Tipo     |
| --------------------- | ------------------------------ | -------- |
| `nome_do_sacado`      | Nome do sacado                 | `string` |
| `documento_do_sacado` | Documento (CPF/CNPJ) do sacado | `string` |
| `data_de_vencimento`  | Data de vencimento             | `Date`   |
| `valor_do_titulo`     | Valor do título, em reais      | `number` |
| `endereco_do_sacado`  | Endereço do sacado             | `string` |
| `bairro_do_sacado`    | Bairro do sacado               | `string` |
| `cep_do_sacado`       | CEP do sacado                  | `string` |
| `cidade_do_sacado`    | Cidade do sacado               | `string` |
| `uf_do_sacado`        | UF do sacado                   | `string` |
| `nosso_numero`        | Número do boleto no banco      | `string` |

#### Campos por banco e formato

- ✅ obrigatório: vazio no arquivo é erro de validação
- ⚠️ opcional: pode vir vazio; nesse caso o valor é nulo e o campo não aparece em `fields`
- ❌ inexistente: o layout não tem o campo, e ele nunca aparece em `fields`

| Banco e formato     | Nome | Documento | Vencimento | Valor | Endereço | Bairro | CEP | Cidade | UF  | Nosso Número |
| ------------------- | :--: | :-------: | :--------: | :---: | :------: | :----: | :-: | :----: | :-: | :----------: |
| Banco do Brasil 240 |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Banco do Brasil 400 |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Bradesco 240        |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Bradesco 400        |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ❌   | ✅  |   ❌   | ❌  |      ⚠️      |
| Caixa 240           |  ✅  |    ✅     |     ✅     |  ✅   |    ⚠️    |   ⚠️   | ⚠️  |   ⚠️   | ⚠️  |      ⚠️      |
| Caixa 400           |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Itaú 240            |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Itaú 400            |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Santander 240       |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Santander 400       |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Sicoob 240          |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Sicoob 400          |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ✅   | ✅  |   ✅   | ✅  |      ⚠️      |
| Sicredi 240         |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ❌   | ✅  |   ✅   | ✅  |      ⚠️      |
| Sicredi 400         |  ✅  |    ✅     |     ✅     |  ✅   |    ✅    |   ❌   | ✅  |   ❌   | ❌  |      ⚠️      |

### Campos extras da lib

| Chave               | Descrição                                                      | Tipo       | Constante                    |
| ------------------- | -------------------------------------------------------------- | ---------- | ---------------------------- |
| `emails_do_sacado`  | E-mails do sacado                                              | `string[]` | `CNAB_EMAIL_FIELDS`          |
| `ddd_do_sacado`     | DDD do celular do sacado                                       | `string`   | `CNAB_TELEFONE_FIELDS`       |
| `celular_do_sacado` | Número do celular do sacado                                    | `string`   | `CNAB_TELEFONE_FIELDS`       |
| `seu_numero`        | Número do documento cobrado, como a nota fiscal ou a duplicata | `string`   | `CNAB_SEU_NUMERO_FIELDS`     |
| `uso_da_empresa`    | Campo livre para a empresa identificar o boleto no seu sistema | `string`   | `CNAB_USO_DA_EMPRESA_FIELDS` |
| `parcela`           | Número da parcela do boleto                                    | `number`   | `CNAB_PARCELA_FIELDS`        |
| `total_de_parcelas` | Total de parcelas                                              | `number`   | `CNAB_PARCELA_FIELDS`        |

Os campos extras da lib são sempre **opcionais**: nos layouts sem eles, e quando vêm vazios, eles não aparecem em `fields`. Um campo preenchido com conteúdo inválido continua sendo erro de validação.

#### Campos de contato

Os campos de contato do pagador não fazem parte dos campos lidos por padrão. Para lê-los, passe as constantes como campos extras:

```ts
import { CNAB_EMAIL_FIELDS, CNAB_TELEFONE_FIELDS } from '@fx55/cnab-lib-ts'

const cnab = cnabFile.read([...CNAB_EMAIL_FIELDS, ...CNAB_TELEFONE_FIELDS])
```

- `CNAB_EMAIL_FIELDS`: e-mail do pagador;
- `CNAB_TELEFONE_FIELDS`: DDD e celular do pagador.

Cada constante traz o campo de cada layout que o tem, e cada arquivo lê só o do seu banco e formato:

| Banco           | Formato  | E-mail | DDD e celular |
| --------------- | :------: | :----: | :-----------: |
| Banco do Brasil | CNAB 240 |   ⚠️   |      ⚠️       |
| Banco do Brasil | CNAB 400 |   ⚠️   |      ❌       |
| Bradesco        | CNAB 240 |   ⚠️   |      ⚠️       |
| Caixa           | CNAB 240 |   ⚠️   |      ⚠️       |
| Caixa           | CNAB 400 |   ⚠️   |      ⚠️       |
| Itaú            | CNAB 400 |   ⚠️   |      ❌       |

#### Seu Número e Uso da Empresa

O Seu Número e o Uso da Empresa ligam o boleto ao sistema de quem o emitiu. Eles não fazem parte da leitura padrão: para lê-los, passe uma das constantes como campos extras.

```ts
import { CNAB_IDENTIFICATION_FIELDS } from '@fx55/cnab-lib-ts'

const cnab = cnabFile.read(CNAB_IDENTIFICATION_FIELDS)
```

- `CNAB_IDENTIFICATION_FIELDS`: Seu Número e Uso da Empresa;
- `CNAB_SEU_NUMERO_FIELDS`: só o Seu Número;
- `CNAB_USO_DA_EMPRESA_FIELDS`: só o Uso da Empresa.

Cada constante traz o campo de cada layout que o tem, e cada arquivo lê só o do seu banco e formato. Os valores vêm como estão no arquivo, sem validação de formato.

| Banco           | Formato  | Seu Número | Uso da Empresa | Parcela e total |
| --------------- | :------: | :--------: | :------------: | :-------------: |
| Banco do Brasil | CNAB 240 |     ⚠️     |       ⚠️       |       ⚠️        |
| Banco do Brasil | CNAB 400 |     ⚠️     |       ⚠️       |       ⚠️        |
| Bradesco        | CNAB 240 |     ⚠️     |       ⚠️       |       ⚠️        |
| Bradesco        | CNAB 400 |     ⚠️     |       ⚠️       |       ⚠️        |
| Caixa           | CNAB 240 |     ⚠️     |       ⚠️       |       ⚠️        |
| Caixa           | CNAB 400 |     ⚠️     |       ⚠️       |       ⚠️        |
| Itaú            | CNAB 240 |     ⚠️     |       ⚠️       |       ⚠️        |
| Itaú            | CNAB 400 |     ⚠️     |       ⚠️       |       ⚠️        |
| Santander       | CNAB 240 |     ⚠️     |       ⚠️       |       ⚠️        |
| Santander       | CNAB 400 |     ⚠️     |       ⚠️       |       ⚠️        |
| Sicoob          | CNAB 240 |     ⚠️     |       ⚠️       |       ⚠️        |
| Sicoob          | CNAB 400 |     ⚠️     |       ⚠️       |       ⚠️        |
| Sicredi         | CNAB 240 |     ⚠️     |       ⚠️       |       ⚠️        |
| Sicredi         | CNAB 400 |     ⚠️     |       ❌       |       ⚠️        |

O Seu Número e o Uso da Empresa são escritos por quem emite o boleto e não são únicos por boleto em todos os emissores. Para identificar um boleto, use o Nosso Número.

#### Parcela

Nenhum layout CNAB tem um campo de parcela comum a todos os bancos. Quem emite o boleto costuma escrever a parcela no fim do Uso da Empresa ou do Seu Número, separada do número do documento. Os campos `parcela` e `total_de_parcelas` procuram esse final nos dois campos, primeiro no Uso da Empresa e depois no Seu Número. Os dois são lidos do primeiro campo em que um formato é encontrado, para que a parcela de um campo nunca se misture com o total de outro.

```ts
import { CNAB_PARCELA_FIELDS } from '@fx55/cnab-lib-ts'

const cnab = cnabFile.read(CNAB_PARCELA_FIELDS)
```

Formatos reconhecidos:

| Formato no fim do campo | Exemplo        | `parcela` | `total_de_parcelas` |
| ----------------------- | -------------- | --------- | ------------------- |
| Espaço, `N/T`           | `12345 1/3`    | `1`       | `3`                 |
| Traço, `N/T`            | `123456-1/3`   | `1`       | `3`                 |
| Traço, `N`, espaço, `T` | `123456-2 5`   | `2`       | `5`                 |
| Traço, `N`              | `XX12345-01`   | `1`       | —                   |
| Ponto, `N`              | `12.345678.01` | `1`       | —                   |
| Barra, `N`              | `XX:123/2`     | `2`       | —                   |

Os dois campos vêm como número inteiro, sem zeros à esquerda. `total_de_parcelas` só aparece quando o formato encontrado traz o total. Quando nenhum formato é encontrado nos dois campos de origem, nenhum dos dois aparece em `fields`.

A parcela é uma interpretação do texto que quem emitiu o boleto escreveu, e não um dado do banco. Para identificar a parcela com segurança, guarde a relação entre o Nosso Número e a parcela no sistema que gera a remessa.

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

### Campos extras

Para ler um campo que a lib não oferece, escreva uma classe de campo e passe-a em `validate` e `read`, no parâmetro `extraFields`. O campo é validado e lido como os demais, e o valor aparece em `fields` pela chave do campo.

Por padrão, um campo extra é aplicado a qualquer banco e formato. Como a posição de um dado costuma mudar de um banco para outro, e principalmente entre CNAB 240 e CNAB 400, o campo pode declarar `bank` e `format` para limitar onde é aplicado. Antes de validar e de ler, a lib descarta os campos extras que não são do banco e do formato do arquivo:

```ts
import { CnabBank, CnabField, CnabFieldType, CnabFormat, Cnab400LineTypeChecker, CnabValidationResult } from '@fx55/cnab-lib-ts'

class DataDeEmissaoBoletoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
  readonly fieldKey = 'data_de_emissao'
  readonly range: [number, number] = [151, 156]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}

const cnab = cnabFile.read([DataDeEmissaoBoletoField])
```

Assim, uma mesma lista com campos de vários bancos pode ser passada para qualquer arquivo: em um Itaú CNAB 400, o campo acima é lido; em um Bradesco ou em um Itaú CNAB 240, ele é ignorado. Sem `bank` e `format`, o campo vale para todos os bancos e formatos. `bank` e `format` só têm efeito em campos extras: os campos do catálogo já são separados por banco e formato em [`cnab-bank-schemas.ts`](src/cnab/bank/cnab-bank-schemas.ts).

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
