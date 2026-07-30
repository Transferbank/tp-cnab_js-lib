# Schema Bradesco CNAB 400

Schema do layout CNAB 400 do Banco Bradesco (237) para **remessa**, seguindo o manual oficial "Layout de Cobrança CNAB 400 — versão em português" (revisado em 27/07/2017), validado contra `brcobranca` (Ruby) e `cnab_yaml` (YAML), duas implementações independentes cujas posições concordam byte a byte.

Retorno não é de interesse do projeto no momento — apenas o header de retorno (`BRADESCO_CNAB400_HEADER_RETORNO`) está disponível para uso direto, sem um detail de retorno correspondente.

## 📁 Estrutura Modular

```
cnab400/
├── header.ts   # Header de Arquivo (remessa e retorno)
├── detail.ts   # Detalhe de Remessa (tipo 1)
├── trailer.ts  # Trailer de Arquivo (tipo 9)
├── index.ts    # Exportações centralizadas
└── README.md   # Este arquivo
```

## 📊 Registros Implementados

### Header de Arquivo - Remessa (`header.ts`)
**Tipo**: 0 | **Operação**: 1 (Remessa)

Primeira linha do arquivo de remessa. Identifica o banco, o cedente e contém informações sobre o arquivo.

**Campos principais**:
- `tipo_registro` (1): sempre '0'
- `tipo_operacao` (2): sempre '1' (Remessa)
- `literal_remessa` (3-9): 'REMESSA'
- `codigo_cedente` (27-46): Código da empresa no banco (20 posições)
- `nome_empresa` (47-76): Razão social do cedente
- `codigo_banco` (77-79): '237' (Bradesco)
- `data_geracao` (95-100): Data de geração (DDMMAA)
- `identificacao_sistema` (109-110): 'MX' (fixo)
- `sequencial_remessa` (111-117): Número sequencial da remessa

**Total**: 16 campos | **Cobertura**: 100% (400 posições)

---

### Header de Arquivo - Retorno (`header.ts`)
**Tipo**: 0 | **Operação**: 2 (Retorno)

Mantido para uso direto, sem um detail de retorno correspondente no momento.

---

### Detalhe (`detail.ts`)
**Tipo**: 1

Contém os dados financeiros do título e informações do sacado para remessa ao banco.

**Campos principais**:
- Identificação da empresa (21-37):
  - `carteira_codigo` (22-24): Código da carteira
  - `agencia_cedente` (25-29): Agência
  - `conta_cedente` (30-36): Conta
  - `conta_cedente_dv` (37): Dígito verificador
- `codigo_ocorrencia` (109-110): Código de ocorrência (ex: 01=Entrada de título)
- `numero_documento` (111-120): Seu número (10 posições)
- `nosso_numero` (71-81): Identificação do título no banco (11 dígitos)
- `nosso_numero_dv` (82): Dígito verificador
- `vencimento` (121-126): Data de vencimento
- `valor_titulo` (127-139): Valor do título
- `especie_titulo` (148-149): Tipo do título
- `aceite` (150): A=Aceite, N=Não aceite
- `data_emissao` (151-156): Data de emissão
- Instruções de cobrança (157-160): 2 instruções
- `juros_mora` (161-173): Juros de mora por dia de atraso
- Desconto, IOF, abatimento (174-218)
- Dados do sacado (219-334) — nomes genéricos (sem prefixo `sacado_*` em `nome`/`logradouro`/`cep`)
  porque `src/validators/cnab400-content-validator.ts` e os demais bancos (Santander, Caixa, Itaú, Sicoob, BB)
  leem esses campos por esse nome; usar outro nome faz o validador cair no fallback de offset fixo:
  - `sacado_codigo_inscricao` (219-220)
  - `sacado_numero_inscricao` (221-234)
  - `nome` (235-274)
  - `logradouro` (275-314)
  - `cep` (327-334)
- `sacador_avalista` (335-394): Nome do sacador/avalista ou 2ª mensagem de cobrança

**Total**: 40 campos | **Cobertura**: 100% (400 posições)

---

### Trailer de Arquivo (`trailer.ts`)
**Tipo**: 9

Última linha do arquivo. Indica o fechamento.

**Campos**:
- `tipo_registro` (1): sempre '9'
- `brancos` (2-394): Espaços em branco ou reservado
- `numero_sequencial` (395-400): Número do último registro

**Total**: 3 campos | **Cobertura**: 100% (400 posições)

---

## 🔑 Campos-Chave do Bradesco

### 1. Código do Cedente (27-46)
**20 posições** - Identificador único da empresa no banco.

### 2. Nosso Número (71-82)
**11 dígitos + 1 DV** - Identificação única do título no banco.
- 71-81: Nosso número (11 dígitos)
- 82: Dígito verificador

### 3. Carteira (22-24)
**3 dígitos** - Código da carteira de cobrança (ex: 109, 175).

### 4. Identificação da Empresa (21-37)
Bloco de identificação do cedente no banco:
- 21: Zero fixo
- 22-24: Carteira (3 dígitos)
- 25-29: Agência (5 dígitos)
- 30-36: Conta (7 dígitos)
- 37: Dígito verificador da conta

## 📚 Fontes

- Manual "Layout de Cobrança CNAB 400 — versão em português" (27/07/2017) - Bradesco
- brcobranca (Ruby) — `remessa/cnab400/bradesco.rb`
- cnab_yaml (YAML) — `cnab400/237/remessa/detalhe.yml`

## 🔄 Uso

```typescript
import { bradescoCnab400 } from './src/schemas/banks/bradesco/cnab400'

// Ou importar schemas individuais
import {
  BRADESCO_CNAB400_HEADER_REMESSA,
  BRADESCO_CNAB400_DETAIL,
  BRADESCO_CNAB400_TRAILER,
} from './src/schemas/banks/bradesco/cnab400'

const schemaRemessa = {
  header: BRADESCO_CNAB400_HEADER_REMESSA,
  detail: BRADESCO_CNAB400_DETAIL,
  trailer: BRADESCO_CNAB400_TRAILER,
}
```
