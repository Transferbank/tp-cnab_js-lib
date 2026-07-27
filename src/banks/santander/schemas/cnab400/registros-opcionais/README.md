# Registros Opcionais — Santander CNAB 400

Esta pasta documenta os registros opcionais que podem ser enviados após os registros de detalhe (tipo 1) em arquivos de remessa CNAB 400 do Santander (033).

## ⚠️ Importante

**Registros opcionais agora implementados como schema `.ts`** — os dois registros documentados (Tipo 8 PIX e Tipo 2/4/5/6/7 Mensagem Variável) estão disponíveis para uso:
- **Tipo 8 (PIX)**: layout 100% confirmado pelo manual oficial v2.36 (jul/2025) e por duas bibliotecas de terceiros (brcobranca, laravel-boleto) — sem incertezas
- **Tipo 2/4/5/6/7 (Mensagem Variável)**: confirmado pelo manual oficial v2.36 (jul/2025); sem confirmação de terceiros. Único RecordSchema reutilizado pelos 5 códigos; subsequencia_3 não tem padrão fixo (inconsistência do manual não resolvida)

Nenhum destes registros aparece no fixture real do projeto (SANTANDER_cnab_400_140.REM, que só tem tipos 0, 1 e 9).

## 📋 Registros Disponíveis

O manual oficial jul/2025 (v2.36) lista a composição do arquivo-remessa como: `REGISTRO 0 = Header | REGISTRO 1 = Registro de Movimento | REGISTRO 8 = Tipo de Pagamento e Dados QR Code (Opcional) | REGISTRO 2/4/5/6/7 = Mensagem Variável por Boleto (Opcional) | REGISTRO 9 = Trailer`.

### 📄 Tipo 2/4/5/6/7 — Mensagem Variável por Título

**Arquivo**: [`mensagem-variavel-titulo/mensagem-variavel-titulo.md`](./mensagem-variavel-titulo/mensagem-variavel-titulo.md)
**Fonte**: manual oficial jul/2025 (v2.36) — revisado; a versão anterior deste documento (baseada no manual de 2009) tinha a estrutura errada (só conhecia 1 de 3 blocos de mensagem)
**Evidência real**: ❌ Sem evidência no fixture do projeto

Cinco códigos de registro compartilham o mesmo layout, mas têm uso diferente: `'2'` = mensagem no Recibo do Pagador (até 24 linhas); `'4'`,`'5'`,`'6'`,`'7'` = mensagens na Ficha de Compensação (1 vez cada, não aparecem em 2ª via).

### 📄 Tipo 8 — Pagamento via PIX / QR Code

**Arquivo**: [`tipo8-pix/tipo8-pix.md`](./tipo8-pix/tipo8-pix.md)
**Fonte**: manual oficial jul/2025 (v2.36) — confirma as 13 posições já documentadas via `brcobranca`/`laravel-boleto`, sem divergências
**Evidência real**: ❌ Sem evidência no fixture do projeto

Permite pagamento do boleto via PIX com QR Code, usando chave DICT do beneficiário.

## 🔍 Como Identificar

Todos os registros opcionais têm o campo `codigo_registro`/`tipo_registro` na posição [1,1]:
- `'0'` = Header
- `'1'` = Detalhe (Registro de Movimento)
- `'2'`, `'4'`, `'5'`, `'6'`, `'7'` = Mensagem Variável por Título
- `'8'` = Pagamento PIX (não documentado no manual de 2009)
- `'9'` = Trailer

Nota: não existe registro tipo `'3'` no CNAB 400 do Santander — o manual pula direto de 2 para 4 na lista de mensagens variáveis.

## 📚 Fontes

- Manual oficial (10/2009): `CNAB 400 COBRANÇA 2015.PDF`
- `brcobranca` (Ruby) — `remessa/cnab400/santander.rb` (detalhe tipo 1), `remessa/cnab400/santander_pix.rb` (tipo 8)
- `laravel-boleto` (PHP) — `Cnab/Remessa/Cnab400/Banco/Santander.php` (detalhe tipo 1 + bloco PIX tipo 8 no mesmo arquivo)
- Fixture real: `tests/fixtures/cnab400/santander/SANTANDER_cnab_400_140.REM` (130 linhas: 1 header + 128 detalhes + 1 trailer, sem registros opcionais)
