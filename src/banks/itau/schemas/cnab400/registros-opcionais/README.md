# Registros Opcionais — Itaú CNAB 400

Esta pasta contém schemas de registros opcionais que podem ser enviados após os registros de detalhe (tipo 1) em arquivos de remessa CNAB 400 do Itaú.

## ⚠️ Importante

Estes registros **NÃO** fazem parte do `BankSchema` padrão (`itauCnab400`). São registros complementares que devem ser importados e processados separadamente quando necessário.

## 📋 Registros Disponíveis

### ✅ Tipo 2 — Complemento de Multa

**Arquivo**: `tipo2/tipo2-multa.ts`  
**Status**: Implementado  
**Uso**: Opcional

Registra ou altera valores/percentuais de multa de um título. Deve vir imediatamente após o detalhe (tipo 1) correspondente.

**Características importantes**:
- Máximo 1 registro tipo 2 por boleto
- Não retorna no arquivo de retorno
- `data_multa` usa formato **DDMMAAAA** (8 dígitos) — único campo do layout com este formato
- Confirmado no fixture real: 319 títulos, cada um seguido de um tipo 2

**Exemplo de uso**:
```typescript
import { TIPO2_MULTA } from '@/schemas/banks/itau/cnab400/registros-opcionais'

// Processar linha tipo 2 após processar detalhe tipo 1
const multa = extractLineFields(linha, TIPO2_MULTA)
```

### ✅ Tipo 4 — Rateio de Crédito

**Arquivo**: `tipo4-rateio-credito.ts`  
**Status**: Implementado  
**Uso**: Opcional

Permite indicar que o crédito do título deve ser rateado entre até 14 contas de crédito por registro. Até 3 registros tipo 4 por título (total: até 42 contas).

**Características importantes**:
- 14 blocos de rateio (agência+conta+dac+valor) por registro
- Manual menciona limite de 30 contas por título
- Rateio pode ser por valor ou percentual (campo `tipo_valor`)
- Agência/conta/nosso número devem coincidir com o tipo 1
- Soma não pode ultrapassar valor nominal do título
- Não aceita desconto ou abatimento quando há rateio
- **Sem evidência real no fixture** (não presente no ITAU_cnab_400.REM)

**Exemplo de uso**:
```typescript
import { TIPO4_RATEIO_CREDITO } from '@/schemas/banks/itau/cnab400/registros-opcionais'

// Processar linha tipo 4 (até 3 por título)
if (linha.charAt(0) === '4') {
  const rateio = extractLineFields(linha, TIPO4_RATEIO_CREDITO)
  
  // Iterar sobre as 14 contas possíveis
  for (let i = 1; i <= 14; i++) {
    const agencia = rateio[`agencia_credito_${i.toString().padStart(2, '0')}`]
    const conta = rateio[`conta_credito_${i.toString().padStart(2, '0')}`]
    const valor = rateio[`valor_credito_${i.toString().padStart(2, '0')}`]
    
    if (agencia.value && conta.value) {
      console.log(`Conta ${i}: ${agencia.value}/${conta.value} = ${valor.value}`)
    }
  }
}
```

### ✅ Tipo 5 — E-mail / Dados do Sacador-Avalista

**Arquivo**: `tipo5/tipo5-email-sacador-avalista.ts`  
**Status**: Implementado  
**Uso**: Opcional

Informa o e-mail do pagador para entrega do boleto por e-mail e/ou complementa os dados do sacador/avalista.

**Características importantes**:
- Deve vir na sequência do registro tipo 1 correspondente
- Não retorna no arquivo de retorno
- Quando dados de sacador/avalista aparecem no tipo 1 e tipo 5, prevalece o tipo 5
- E-mail do pagador tem 120 caracteres (maior campo de texto do layout)
- Em ambiente de testes, envio por e-mail não funciona (entrega física)
- **Sem evidência real no fixture** (não presente no ITAU_cnab_400.REM)

**Exemplo de uso**:
```typescript
import { TIPO5_EMAIL_SACADOR_AVALISTA } from '@/schemas/banks/itau/cnab400/registros-opcionais'

// Processar linha tipo 5 após processar detalhe tipo 1
if (linha.charAt(0) === '5') {
  const dados = extractLineFields(linha, TIPO5_EMAIL_SACADOR_AVALISTA)
  
  // E-mail do pagador (se informado)
  if (dados.email_pagador.value?.trim()) {
    console.log(`E-mail: ${dados.email_pagador.value}`)
  }
  
  // Dados do sacador/avalista (se informado)
  if (dados.sacador_numero_inscricao.value) {
    console.log(`Sacador: ${dados.sacador_numero_inscricao.value}`)
    console.log(`Endereço: ${dados.sacador_logradouro.value}`)
    console.log(`Cidade: ${dados.sacador_cidade.value}/${dados.sacador_estado.value}`)
  }
}
```

### ✅ Tipo 6 — Emissão de Boleto pelo Cedente

**Arquivo**: `tipo6/` (4 layouts)  
**Status**: Implementado  
**Uso**: Opcional (fluxo paralelo)

Família de registros paralela e independente ao fluxo tipo 1/2/4/5. Serve para o cedente pedir ao Itaú que emita fisicamente o boleto.

**Características importantes**:
- Usa o mesmo header e trailer já implementados
- Tem 4 layouts diferentes identificados pelo campo `codigo_layout` (posição 2):
  - **Layout 1** (`codigo_layout='1'`): Dados do título (36 campos)
  - **Layout 2** (`codigo_layout='2'`): Instruções linhas 1-5 (5 campos de 69 caracteres)
  - **Layout 3** (`codigo_layout='3'`): Instruções linhas 6-9 (4 campos de 69 caracteres)
  - **Layout 4** (`codigo_layout='4'`): Extensão de dados do sacador/avalista
- Layout 1: campo `valor_titulo` usa 5 decimais para moeda variável (não 2)
- **Sem evidência real no fixture** (não presente no ITAU_cnab_400.REM)

**Exemplo de uso**:
```typescript
import { 
  TIPO6_LAYOUT1_TITULO,
  TIPO6_LAYOUT2_INSTRUCOES_1_5,
  TIPO6_LAYOUT3_INSTRUCOES_6_9,
  TIPO6_LAYOUT4_SACADOR_AVALISTA
} from '@/schemas/banks/itau/cnab400/registros-opcionais'

// Processar linha tipo 6 - identificar layout pelo segundo dígito
if (linha.charAt(0) === '6') {
  const codigoLayout = linha.charAt(1)
  
  switch (codigoLayout) {
    case '1':
      const titulo = extractLineFields(linha, TIPO6_LAYOUT1_TITULO)
      console.log(`Título: ${titulo.nosso_numero.value}`)
      console.log(`Pagador: ${titulo.nome.value}`)
      break
    case '2':
      const instrucoes1a5 = extractLineFields(linha, TIPO6_LAYOUT2_INSTRUCOES_1_5)
      console.log(`Instruções 1-5: ${instrucoes1a5.linha_1.value}...`)
      break
    case '3':
      const instrucoes6a9 = extractLineFields(linha, TIPO6_LAYOUT3_INSTRUCOES_6_9)
      console.log(`Instruções 6-9: ${instrucoes6a9.linha_6.value}...`)
      break
    case '4':
      const sacador = extractLineFields(linha, TIPO6_LAYOUT4_SACADOR_AVALISTA)
      console.log(`Sacador: ${sacador.logradouro.value}`)
      break
  }
}
```

## 🔍 Como Identificar

Todos os registros opcionais têm o campo `tipo_registro` na posição [1,1]:
- `'0'` = Header
- `'1'` = Detalhe
- `'2'` = Multa ✅
- `'4'` = Rateio ✅
- `'5'` = E-mail / Sacador-Avalista ✅
- `'6'` = Emissão de boleto ✅ (4 layouts: `codigo_layout` na posição [2,2])
- `'9'` = Trailer

**Tipo 6 - Identificação de Layouts**:
O registro tipo 6 tem 4 layouts diferentes identificados pelo campo `codigo_layout` (posição [2,2]):
- `'1'` = Dados do título
- `'2'` = Instruções linhas 1-5
- `'3'` = Instruções linhas 6-9
- `'4'` = Sacador/Avalista

## 📚 Fontes

- Manual oficial Itaú: `layout_cobranca_400bytes_cnab_itau.pdf`
- Fixture real: `tests/fixtures/cnab400/itau/ITAU_cnab_400.REM` (640 linhas)

## ⚙️ Implementação no Validador

Para processar registros opcionais no validador CNAB 400:

```typescript
// Detectar tipo de registro
const tipoRegistro = linha.charAt(0)

switch (tipoRegistro) {
  case '0':
    // Processar header
    break
  case '1':
    // Processar detalhe
    break
  case '2':
    // Processar multa (opcional)
    const multa = extractLineFields(linha, TIPO2_MULTA)
    break
  case '4':
    // Processar rateio de crédito (opcional)
    const rateio = extractLineFields(linha, TIPO4_RATEIO_CREDITO)
    break
  case '5':
    // Processar e-mail / sacador-avalista (opcional)
    const emailSacador = extractLineFields(linha, TIPO5_EMAIL_SACADOR_AVALISTA)
    break
  case '6':
    // Processar emissão de boleto (opcional) - identificar layout
    const codigoLayout = linha.charAt(1)
    switch (codigoLayout) {
      case '1':
        const titulo = extractLineFields(linha, TIPO6_LAYOUT1_TITULO)
        break
      case '2':
        const instrucoes1a5 = extractLineFields(linha, TIPO6_LAYOUT2_INSTRUCOES_1_5)
        break
      case '3':
        const instrucoes6a9 = extractLineFields(linha, TIPO6_LAYOUT3_INSTRUCOES_6_9)
        break
      case '4':
        const sacador = extractLineFields(linha, TIPO6_LAYOUT4_SACADOR_AVALISTA)
        break
    }
    break
  case '9':
    // Processar trailer
    break
  default:
    // Tipo desconhecido
}
```

## 📊 Estatísticas do Fixture Real

- **Total de linhas**: 640
- **Header**: 1
- **Detalhes (tipo 1)**: 319
- **Multas (tipo 2)**: 319 (1:1 com detalhes)
- **Outros tipos**: 0 (nenhum tipo 4, 5 ou 6 presente)
- **Trailer**: 1

Todos os 319 títulos no fixture têm um registro tipo 2 associado, confirmando o padrão de uso comum deste registro opcional.
