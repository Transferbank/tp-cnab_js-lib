# Bradesco CNAB 240 - Schema Modularizado

Este diretório contém o schema do Bradesco para arquivos CNAB 240, dividido em arquivos menores para facilitar manutenção e extensibilidade.

Fonte principal do layout: manual oficial **"Manual de Procedimentos Operacionais para Troca de Arquivos 240 Posições"**, versão 04 (dezembro/2024). Complementado por `pycnab240` como segunda fonte de verificação e para os JSONs prontos de header/trailer de arquivo e de lote.

## 📁 Estrutura

```
cnab240/
├── index.ts              # Exporta o schema completo
├── header.ts              # Header de Arquivo (pos 8 = '0')
├── batch-header.ts          # Header de Lote (pos 8 = '1')
├── segment-p.ts           # Segmento P - Dados financeiros (pos 14 = 'P')
├── segment-q.ts           # Segmento Q - Dados do pagador (pos 14 = 'Q')
├── segment-r.ts           # Segmento R - Descontos/multa/débito automático (pos 14 = 'R', opcional)
├── segment-s.ts            # Segmento S - Mensagens para impressão (pos 14 = 'S', opcional, 2 variantes)
├── segment-s-helper.ts     # Identifica e parseia as variantes do Segmento S
├── segment-y01.ts          # Segmento Y-01 - Beneficiário Final completo (pos 14 = 'Y', opcional)
├── segment-y04.ts          # Segmento Y-04 - Contato + PIX (pos 14 = 'Y', opcional)
├── segment-y50.ts          # Segmento Y-50 - Rateio de crédito (pos 14 = 'Y', opcional, repetível)
├── batch-trailer.ts          # Trailer de Lote (pos 8 = '5')
├── trailer.ts                # Trailer de Arquivo (pos 8 = '9')
├── COMPLETUDE.md             # Histórico da completude original dos Segmentos P e Q
└── README.md                 # Este arquivo
```

## 🎯 Uso

### Importar schema completo:
```typescript
import { bradescoCnab240 } from './schemas/banks/bradesco/cnab240'

// Usar normalmente
const header = extractLineFields(line, bradescoCnab240.headerArquivo!)
const headerLote = extractLineFields(line, bradescoCnab240.headerLote!)
```

### Importar segmentos individuais:
```typescript
import {
  BRADESCO_CNAB240_HEADER,
  BRADESCO_CNAB240_BATCH_HEADER,
  BRADESCO_CNAB240_SEGMENT_P,
  BRADESCO_CNAB240_SEGMENT_Q,
  BRADESCO_CNAB240_SEGMENT_R,
  BRADESCO_CNAB240_SEGMENT_Y01,
  BRADESCO_CNAB240_SEGMENT_Y04,
  BRADESCO_CNAB240_SEGMENT_Y50,
  BRADESCO_CNAB240_BATCH_TRAILER,
  BRADESCO_CNAB240_TRAILER,
} from './schemas/banks/bradesco/cnab240'

// Usar segmentos diretamente
const header = extractLineFields(line, BRADESCO_CNAB240_HEADER)
const segP = extractLineFields(line, BRADESCO_CNAB240_SEGMENT_P)
const segY01 = extractLineFields(line, BRADESCO_CNAB240_SEGMENT_Y01)
```

## 📋 Detalhes dos Segmentos

### Header de Arquivo (`header.ts`) - **✅ Completo**
- **Posição 8**: `'0'` (identificador de header)
- **Conteúdo**: Dados do cedente (emissor), código do banco, data/hora de geração, identificação do arquivo
- **Função**: "Capa" do arquivo - identifica quem mandou e quando
- **Status**: **24 campos completos** cobrindo todas as posições (1-240)
- **ATENÇÃO**: O campo `arquivo_sequencia` (pos 158-163) NÃO é o número sequencial de remessa - use `numero_remessa_retorno` do Header de Lote (pos 184-191)

### Header de Lote (`batch-header.ts`) - **✅ Completo**
- **Posição 8**: `'1'` (identificador de header de lote)
- **Conteúdo**: Dados do cedente por lote (convênio, agência/conta, DVs), mensagens livres (`informacao_1`/`informacao_2`), número sequencial de remessa/retorno (o autoritativo, ver nota acima), data de gravação e de crédito
- **Função**: Agrupa os registros de detalhe (P/Q/R/S/Y) que pertencem ao mesmo tipo de serviço (cobrança)
- **Status**: **23 campos completos** cobrindo todas as posições (1-240)

### Segmento P (`segment-p.ts`) - Remessa - **✅ Completo**
- **Posição 8**: `'3'` (detalhe)
- **Posição 14**: `'P'` (identificador do segmento)
- **Conteúdo**: Dados financeiros do título (valor, vencimento, nosso número, juros, descontos, protesto, baixa, etc.)
- **Função**: Informações monetárias e de cobrança de cada boleto
- **Status**: **42 campos completos** cobrindo todas as posições (1-240)

### Segmento Q (`segment-q.ts`) - Remessa - **✅ Completo**
- **Posição 8**: `'3'` (detalhe)
- **Posição 14**: `'Q'` (identificador do segmento)
- **Conteúdo**: Dados do pagador/sacado (nome, CPF/CNPJ, endereço completo, bairro, cidade, UF), Beneficiário Final (resumido) e banco correspondente
- **Função**: Identificação completa de quem vai pagar o boleto
- **Status**: **22 campos completos** cobrindo todas as posições (1-240)
- Campos de posição 154-209 (`beneficiario_final_inscricao_tipo`/`beneficiario_final_inscricao_numero`/`beneficiario_final_nome`) já usam a nomenclatura BACEN atual, consistente com `segment-y01.ts` e os schemas CNAB400 de BB/Bradesco/Sicredi.

### Segmento R (`segment-r.ts`) - Remessa (Opcional) - **✅ Completo**
- **Posição 8**: `'3'` (detalhe)
- **Posição 14**: `'R'` (identificador do segmento)
- **Conteúdo**: Descontos adicionais (2º e 3º descontos), multa, informações ao sacado e débito automático
- **Função**: Informações complementares de descontos e cobrança automática
- **Quando aparece**: Somente quando há descontos além do primeiro, multa configurada, ou débito automático
- **Status**: **29 campos completos** cobrindo todas as posições (1-240)
- **Nuance de negócio**: o campo `informacao_sacado_2` (posições 100-139) tem dupla função — texto livre ("Mensagem 3") ou, quando o título usa débito automático, uma sub-estrutura (tipo de operação, uso de cheque especial, consulta de saldo, número/prazo do contrato). Documentado na descrição do campo, sem necessidade de split.

### Segmento S (`segment-s.ts` + `segment-s-helper.ts`) - Remessa (Opcional) - **✅ Completo**
- **Posição 8**: `'3'` (detalhe)
- **Posição 14**: `'S'` (identificador do segmento)
- **Conteúdo**: Mensagens para impressão no boleto, com **duas variantes mutuamente exclusivas** dependendo do campo `tipo_impressao` (posição 18):
  - Variante A (tipo 1 ou 2): mensagem livre de até 140 caracteres
  - Variante B (tipo 3): cinco blocos de informação fixos de 40 caracteres cada
- **Status**: **Completo**, validado posição a posição contra o manual 2024 nas duas variantes. Use `parseSegmentS()`/`identifySegmentSVariant()` do helper para parsear corretamente.

### Segmento Y-01 (`segment-y01.ts`) - Remessa/Retorno (Opcional) - **✅ Novo**
- **Posição 8**: `'3'` / **Posição 14**: `'Y'` / **`codigo_registro_opcional`**: `'01'`
- **Conteúdo**: Dados completos do Beneficiário Final — tipo/número de inscrição, nome, **e endereço/bairro/CEP/cidade/UF** (mais completo que o resumo já embutido no Segmento Q)
- **Status**: **18 campos completos**

### Segmento Y-04 (`segment-y04.ts`) - Remessa/Retorno (Opcional) - **✅ Novo**
- **Posição 8**: `'3'` / **Posição 14**: `'Y'` / **`codigo_registro_opcional`**: `'03'`
- **Conteúdo**: Envio de documento por meio alternativo — e-mail, celular/SMS, e **dados de PIX** (tipo de chave, chave PIX/URL do QR Code, TXID)
- **Status**: **15 campos completos**
- **Nota**: este é o segmento mais recente do manual — reflete a integração PIX/QR Code na cobrança. Não existe em manuais antigos nem no `pycnab240` vendorizado no projeto.

### Segmento Y-50 (`segment-y50.ts`) - Remessa/Retorno (Opcional, repetível) - **✅ Novo**
- **Posição 8**: `'3'` / **Posição 14**: `'Y'` / **`codigo_registro_opcional`**: `'50'`
- **Conteúdo**: Rateio de crédito entre múltiplas contas — pode ocorrer várias vezes por título (o manual não fixa um limite; depende de acordo entre banco e cliente)
- **Status**: **29 campos completos**

### Trailer de Lote (`batch-trailer.ts`) - **✅ Completo**
- **Posição 8**: `'5'` (identificador de trailer de lote)
- **Conteúdo**: Totalizadores do lote — quantidade de registros e, separadamente, quantidade/valor de títulos por tipo de carteira (Simples, Vinculada, Caucionada, Descontada)
- **Status**: **15 campos completos**

### Trailer de Arquivo (`trailer.ts`) - **✅ Completo**
- **Posição 8**: `'9'` (identificador de trailer)
- **Conteúdo**: Totalizadores do arquivo (quantidade de lotes, registros totais, contas para conciliação)
- **Função**: Valida que o arquivo terminou corretamente e fornece totalizadores gerais
- **Status**: **8 campos completos** cobrindo todas as posições (1-240)

### ⚠️ Segmentos Não Implementados

Os **Segmentos T e U** existem no padrão FEBRABAN CNAB 240, mas o manual 2024 confirma que são usados apenas em **arquivos de retorno** ("Obrigatório - Retorno"). Como o foco deste projeto é o parsing de **arquivos de remessa** (envio de boletos ao banco), estes segmentos não foram implementados:

- **Segmento T**: Dados do título no retorno (liquidações, baixas, etc.)
- **Segmento U**: Valores recebidos, tarifas, juros cobrados

Se houver necessidade futura de processar arquivos de retorno, estes segmentos podem ser adicionados seguindo o mesmo padrão dos existentes.

## 🔧 Extensibilidade

Para adicionar um novo segmento no futuro:

1. Crie um novo arquivo `segment-[nome].ts`
2. Exporte a constante `BRADESCO_CNAB240_SEGMENT_[NOME]`
3. Adicione o campo correspondente à interface `BankSchema` em `src/types/bank-schema.ts` (ex: `segmentoY01?`, `headerLote?`)
4. Adicione ao `index.ts`:
```typescript
import { BRADESCO_CNAB240_SEGMENT_NEW } from './segment-new'

export const bradescoCnab240: BankSchema = {
  // ...
  segmentoNovo: BRADESCO_CNAB240_SEGMENT_NEW,
}

export { BRADESCO_CNAB240_SEGMENT_NEW } from './segment-new'
```

## 📚 Referências

- Manual oficial Bradesco: **"Manual de Procedimentos Operacionais para Troca de Arquivos 240 Posições"**, versão 04 (dez/2024) — fonte primária para todos os campos, inclusive os 3 registros Y novos
- `pycnab240` — usado para header/trailer de arquivo e de lote, e como segunda fonte de verificação nos Segmentos P/Q/R
- `laravel-boleto` (PHP) — concordância cruzada nas posições dos Segmentos P/Q/R
- **Ver `COMPLETUDE.md`** para o histórico da completude original dos Segmentos P e Q

## ⚠️ Compatibilidade

O arquivo `cnab240.ts` na pasta pai continua existindo para retrocompatibilidade, mas redireciona para esta estrutura modularizada.

```typescript
// Ambas as formas funcionam:
import { bradescoCnab240 } from './bradesco/cnab240'     // ✅ Novo (recomendado)
import { bradescoCnab240 } from './bradesco/cnab240.ts'  // ✅ Compatível (deprecated)
```
