# Schema Santander CNAB 240

Schema completo do layout CNAB 240 do Banco Santander (033), seguindo o manual oficial "Layout Padrão 240 – Cobrança, Versão 2.5" (Setembro/2014).

## 📁 Estrutura Modular

```
cnab240/
├── header.ts           # Header de Arquivo (tipo 0)
├── batch-header.ts      # Header de Lote (tipo 1)
├── segment-p.ts       # Segmento P - dados financeiros do título
├── segment-q.ts       # Segmento Q - dados do pagador/sacado
├── segment-r.ts       # Segmento R - descontos adicionais e multa (opcional)
├── batch-trailer.ts     # Trailer de Lote (tipo 5)
├── trailer.ts          # Trailer de Arquivo (tipo 9)
├── index.ts            # Exportações centralizadas
└── README.md           # Este arquivo
```

## 📊 Registros Implementados

### Header de Arquivo (`header.ts`)
**Tipo**: 0 | **Lote**: 0000

Primeira linha do arquivo. Identifica o banco, o cedente (beneficiário) e contém informações sobre o arquivo.

**Campos principais**:
- `codigo_transmissao` (33-47): Código único do cedente no Santander (agência + "0000" + código do cliente)
- `cedente_inscricao_tipo` e `cedente_inscricao_numero` (17-32): CPF/CNPJ do cedente
- `arquivo_data_de_geracao` (144-151): Data de geração do arquivo
- `arquivo_sequencia` (158-163): Número sequencial do arquivo
- `arquivo_layout` (164-166): Versão do layout (040)

**Total**: 21 campos | **Cobertura**: 100% (240 posições)

---

### Header de Lote (`batch-header.ts`)
**Tipo**: 1

Primeira linha de cada lote. Agrupa títulos do mesmo tipo de serviço (cobrança).

**Campos principais**:
- `codigo_transmissao` (54-68): Código de transmissão do cedente
- `cedente_nome` (74-103): Nome da empresa
- `mensagem_1` e `mensagem_2` (104-183): Mensagens para todos os boletos do lote
- `numero_remessa_retorno` (184-191): Número sequencial da remessa

**Total**: 14 campos | **Cobertura**: 100% (240 posições)

---

### Segmento P (`segment-p.ts`)
**Tipo**: 3 | **Segmento**: P

Dados financeiros do título (boleto): valor, vencimento, nosso número, juros, descontos.

**Campos principais**:
- `controle_lote` (4-7): Número do lote
- `nosso_numero` (45-57): Identificador único do título no banco
- `vencimento_titulo` (78-85): Data de vencimento
- `valor_titulo` (86-100): Valor nominal do título
- `numero_documento` (63-77): Seu número (identificação na empresa)
- `cedente_agencia`, `cedente_conta` (18-36): Dados da conta do cedente
- `conta_cobranca` (38-42): Conta cobrança específica do Santander
- `juros_mora_*` (118-141): Configuração de juros
- `desconto_*` (142-165): Configuração de desconto
- `identificacao_titulo` (196-220): Identificação do título na empresa
- `protesto_*` e `baixa_*` (221-227): Instruções de protesto e baixa

**Total**: 45 campos | **Cobertura**: 100% (240 posições)

---

### Segmento Q (`segment-q.ts`)
**Tipo**: 3 | **Segmento**: Q

Dados do pagador/sacado (quem vai pagar o boleto).

**Campos principais**:
- `controle_lote` (4-7): Número do lote
- `sacado_inscricao_tipo` e `sacado_inscricao_numero` (18-33): CPF/CNPJ do pagador
- `sacado_nome` (34-73): Nome do pagador
- `sacado_endereco` (74-113): Endereço completo
- `sacado_bairro` (114-128): Bairro
- `sacado_cep` e `sacado_cep_sufixo` (129-136): CEP
- `sacado_cidade` e `sacado_uf` (137-153): Cidade e Estado
- `sacador_*` (154-209): Dados do sacador/avalista
- **Campos exclusivos do Santander para carnê/parcelamento**:
  - `carne_identificador` (210-212)
  - `parcela_numero` (213-215)
  - `parcela_quantidade` (216-218)
  - `plano_numero` (219-221)

**Total**: 24 campos | **Cobertura**: 100% (240 posições)

---

### Segmento R (`segment-r.ts`) [OPCIONAL]
**Tipo**: 3 | **Segmento**: R

Descontos adicionais, multa e mensagens livres para impressão no boleto.

**Campos principais**:
- `desconto2_*` (18-41): Segundo desconto
- `desconto3_*` (42-65): Terceiro desconto
- `multa_*` (66-89): Configuração de multa
- `mensagem_1` e `mensagem_2` (100-179): Mensagens livres para o boleto

**Total**: 12 campos | **Cobertura**: 100% (240 posições)

---

### Trailer de Lote (`batch-trailer.ts`)
**Tipo**: 5

Última linha de cada lote. Contém totalizadores do lote.

**Campos principais**:
- `totais_quantidade_registros` (18-23): Total de registros no lote
- `totais_quantidade_titulos` (24-29): Total de títulos em cobrança
- `totais_valor_titulos` (30-46): Valor total dos títulos
- Campos de títulos vinculados e caucionados (47-92)

**Total**: 12 campos | **Cobertura**: 100% (240 posições)

---

### Trailer de Arquivo (`trailer.ts`)
**Tipo**: 9 | **Lote**: 9999

Última linha do arquivo. Contém totalizadores gerais.

**Campos principais**:
- `totais_quantidade_lotes` (18-23): Total de lotes no arquivo
- `totais_quantidade_registros` (24-29): Total de registros no arquivo

**Total**: 5 campos | **Cobertura**: 100% (240 posições)

---

## 🎯 Cobertura Completa

Todos os segmentos implementados possuem **100% de cobertura** das 240 posições:
- ✅ Header de Arquivo: 21 campos (240/240 posições)
- ✅ Header de Lote: 14 campos (240/240 posições)
- ✅ Segmento P: 45 campos (240/240 posições)
- ✅ Segmento Q: 24 campos (240/240 posições)
- ✅ Segmento R: 12 campos (240/240 posições)
- ✅ Trailer de Lote: 12 campos (240/240 posições)
- ✅ Trailer de Arquivo: 5 campos (240/240 posições)

## 🔑 Campos-Chave Específicos do Santander

### 1. Código de Transmissão
**Posições**: 33-47 (Header Arquivo) e 54-68 (Header Lote)

Formato: `AAAA0000CCCCCCC` (15 caracteres)
- `AAAA`: Número da agência (4 dígitos)
- `0000`: Zeros fixos
- `CCCCCCC`: Código do cliente (7 dígitos)

É o identificador principal do cedente junto ao banco.

### 2. Conta Cobrança
**Posição**: 38-42 (Segmento P)

Campo específico do Santander para identificar a conta de cobrança.

### 3. Campos de Carnê/Parcelamento
**Posições**: 210-221 (Segmento Q)

Exclusivos do Santander para controle de carnês:
- `carne_identificador`: Identificador do carnê
- `parcela_numero`: Número da parcela atual
- `parcela_quantidade`: Total de parcelas
- `plano_numero`: Número do plano de parcelamento

## 📚 Fontes

- Manual "Layout Padrão 240 – Cobrança, Versão 2.5" (Setembro/2014)
- pycnab240 (Python)
- laravel-boleto (PHP)
- brcobranca (Ruby)
- cnab_yaml (YAML)

## 📝 Gap Analysis

Todos os campos identificados no [gap analysis](../../../docs/comparativos/santander/gap-analise-schema-cnab240-santander.md) foram implementados:

✅ **Header de Arquivo**: 5 campos adicionados
✅ **Header de Lote**: Registro completo implementado  
✅ **Segmento P**: ~38 campos adicionados (principalmente `controle_lote`, `nosso_numero`, `cedente_agencia`, `cedente_conta`)
✅ **Segmento Q**: 8 campos adicionados (principalmente `controle_lote`, `sacado_bairro`, campos de carnê)
✅ **Segmento R**: Registro completo implementado
✅ **Trailer de Lote**: Registro completo implementado
✅ **Trailer de Arquivo**: 2 campos adicionados

**Status**: ✅ Schema 100% completo e alinhado com todas as libs de referência.

## 🔄 Uso

```typescript
import { santanderCnab240 } from './src/schemas/banks/santander/cnab240'

// Ou importar schemas individuais
import {
  SANTANDER_CNAB240_FILE_HEADER,
  SANTANDER_CNAB240_SEGMENT_P,
  SANTANDER_CNAB240_SEGMENT_Q,
} from './src/schemas/banks/santander/cnab240'
```
