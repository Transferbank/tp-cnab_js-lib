# Registros Opcionais — Bradesco CNAB 400

Esta pasta documenta os registros opcionais que podem ser enviados após os registros de detalhe (tipo 1) em arquivos de remessa CNAB 400 do Bradesco (237), conforme o manual oficial "Layout de Cobrança CNAB 400 — versão em português" (revisado 27/07/2017).

## ⚠️ Importante

Estes registros **NÃO** fazem parte do schema padrão em `../detail.ts`/`../header.ts`/`../trailer.ts`. São registros complementares, documentados aqui para referência futura — nenhum deles tem `.ts` implementado ainda (ver [[user-domain-and-standards]] no fluxo do projeto: documentação primeiro, implementação sob demanda).

## 📋 Registros Disponíveis

O manual oficial lista a composição do arquivo-remessa como: `Registro 0 - Header | Registro 1 - Transação | Registro 2 - Mensagem (opcional) | Registro 3 - Rateio de Crédito (opcional) | Registro 7 - Pagador Avalista (opcional) | Registro 9 - Trailler`. Um registro tipo 6 adicional (sem nome oficial explícito no manual) também existe e está documentado aqui.

### 📄 Tipo 2 — Mensagem / Descontos Adicionais

**Arquivo**: [`tipo2/tipo2-mensagem-descontos-adicionais.md`](./tipo2/tipo2-mensagem-descontos-adicionais.md)
**Evidência real**: ✅ Confirmado — 37 registros no fixture `remessa-multipla.txt`, um por detalhe (1:1)

Até 4 mensagens livres de 80 caracteres + 2º e 3º desconto adicional (além do desconto do tipo 1).

### 📄 Tipo 3 — Rateio de Crédito

**Arquivo**: [`tipo3/tipo3-rateio-credito.md`](./tipo3/tipo3-rateio-credito.md)
**Evidência real**: ❌ Sem evidência no fixture do projeto

Rateia o crédito do título entre até 3 beneficiários por registro, contas do próprio Bradesco (237).

### 📄 Tipo 6 — Transferência entre Carteiras

**Arquivo**: [`tipo6/tipo6-transferencia-carteira.md`](./tipo6/tipo6-transferencia-carteira.md)
**Evidência real**: ❌ Sem evidência no fixture do projeto

Acompanha o detalhe tipo 1 quando a ocorrência 23 ("Transferência entre Carteiras") é usada. Requer cadastro prévio na agência.

### 📄 Tipo 7 — Dados do Sacador/Avalista

**Arquivo**: [`tipo7/tipo7-sacador-avalista.md`](./tipo7/tipo7-sacador-avalista.md)
**Evidência real**: ❌ Sem evidência no fixture do projeto

Complementa endereço/CEP/cidade/UF do sacador-avalista (o tipo 1 só traz o nome).

## 🔍 Como Identificar

Todos os registros opcionais têm o campo `tipo_registro` na posição [1,1]:
- `'0'` = Header
- `'1'` = Detalhe (Transação)
- `'2'` = Mensagem / Descontos Adicionais ✅ (confirmado no fixture)
- `'3'` = Rateio de Crédito
- `'6'` = Transferência entre Carteiras
- `'7'` = Dados do Sacador/Avalista
- `'9'` = Trailer

## 📚 Fontes

- Manual oficial Bradesco: `4008-524-0121-layout-cobranca-versao-portugues.pdf`
- `brcobranca` (Ruby) — `remessa/cnab400/bradesco.rb` (confirma tipo 2 via `monta_descontos_adicionais`; não implementa tipo 3/6/7)
- `laravel-boleto` (PHP) — `Cnab/Remessa/Cnab400/Banco/Bradesco.php` (não implementa nenhum destes registros opcionais)
- Fixture real: `tests/fixtures/cnab400/bradesco/remessa-multipla.txt` (76 linhas: 1 header + 37 detalhes + 37 mensagens tipo 2 + 1 trailer)
