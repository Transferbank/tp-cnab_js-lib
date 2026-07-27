# Registros Opcionais — Sicredi CNAB 400

Esta pasta contém schemas de registros opcionais que podem ser enviados após os registros de detalhe (tipo 1) em arquivos de remessa CNAB 400 do Sicredi.

## ⚠️ Importante

Estes registros **NÃO** fazem parte do `BankSchema` padrão (`sicrediCnab400`). São registros complementares que devem ser importados e processados separadamente quando necessário.

**Nenhum destes cinco registros tem fixture real ou biblioteca de terceiros confirmando as posições** (diferente dos registros opcionais de Itaú/BB) — a única fonte é o manual oficial (`2026_03_12_manual_cnab_400_30.pdf`, v3.0, fev/2026).

## 📋 Registros Disponíveis

### Tipo 2 — Mensagem

**Arquivo**: `tipo2/tipo2-mensagem.ts`
**Uso**: Opcional

Texto livre (até 4 linhas de 80 caracteres) para impressão no boleto. Instruções de juros/multa/desconto/protesto/negativação não precisam ser cadastradas aqui — já são impressas automaticamente a partir dos campos de negócio do detalhe.

### Tipo 5 — Informativo

**Arquivo**: `tipo5/tipo5-informativo.ts`
**Uso**: Opcional

Dados/texto adicional ao boleto. Até 5 registros encadeados por título (20 linhas no total).

### Tipo 6 — Beneficiário Final

**Arquivo**: `tipo6/tipo6-beneficiario-final.ts`
**Uso**: Obrigatório apenas quando houver Beneficiário Final para o título

Dados completos (com endereço) do Beneficiário Final — nomenclatura BACEN 3598/3656/3956, substitui "Sacador/Avalista".

### Tipo 7 — Descontos 2 e 3

**Arquivo**: `tipo7/tipo7-descontos.ts`
**Uso**: Opcional

2º e 3º nível de desconto para o mesmo título. Só é gerado quando o desconto 1 (no detalhe) já foi informado; excludente com desconto por dia de antecipação.

### Tipo 8 — Híbrido / QR Code

**Arquivo**: `tipo8/tipo8-hibrido.ts`
**Uso**: Obrigatório quando o boleto é híbrido (`tipo_boleto` do detalhe = `'H'`)

Único registro opcional condicionado a um campo do detalhe, não livre como os outros quatro.

## 🔍 Como Identificar

Todos os registros opcionais têm o campo `tipo_registro` na posição [1,1]:
- `'0'` = Header
- `'1'` = Detalhe
- `'2'` = Mensagem
- `'5'` = Informativo
- `'6'` = Beneficiário Final
- `'7'` = Descontos 2 e 3
- `'8'` = Híbrido
- `'9'` = Trailer

## 📚 Fontes

- Manual oficial Sicredi: `2026_03_12_manual_cnab_400_30.pdf` (v3.0, fev/2026)
