# Registros Opcionais — Caixa CNAB 400

Esta pasta contém a documentação dos registros opcionais que podem ser enviados em arquivos de remessa CNAB 400 da Caixa Econômica Federal, além do detalhe obrigatório (registro tipo 1).

## ⚠️ Importante

**Registros opcionais agora implementados como schema `.ts`** — os três registros documentados (Tipo 2, 3 e 4) estão disponíveis para uso, mas ainda sem confirmação de biblioteca de terceiros e sem fixture real para validação. Diferente de Itaú/BB/Sicredi (que já têm `.ts` + `.md` + testes com fixtures reais), aqui temos `.ts` + `.md` baseados exclusivamente no manual oficial — é recomendado validar contra um arquivo real antes de uso em produção.

Nenhum destes registros tem confirmação de biblioteca de terceiros (`laravel-boleto`, única lib de referência do projeto para Caixa, não implementa nenhum deles) — toda a informação vem exclusivamente do manual oficial `caixa_layout_CNAB_400_2024.pdf`.

## 📋 Registros Documentados

### Tipo 2 — Mensagens do Título

**Arquivo**: `tipo2/tipo2-mensagens-titulo.md`
**Uso**: Opcional

Até 6 mensagens livres de 40 caracteres cada, impressas no boleto do título correspondente.

### Tipo 3 — Informações para Envio por E-mail/SMS

**Arquivo**: `tipo3/tipo3-envio-email-sms.md`
**Uso**: Opcional

E-mail e/ou celular do pagador, para envio do boleto/aviso por e-mail e/ou SMS.

### Tipo 4 — Tipo de Pagamento e Rateio de Crédito

**Arquivo**: `tipo4/tipo4-tipo-pagamento-rateio.md`
**Uso**: Opcional

O mais complexo dos três: combina definição de faixa de valores aceitos (pagamento com valor divergente do nominal) com rateio de crédito entre beneficiários no mesmo registro — diferente do padrão dos outros bancos, que separam essas duas funções.

## 🔍 Como Identificar

O campo `codigo_registro` (posição [1,1]) identifica o tipo:
- `'0'` = Header
- `'1'` = Detalhe
- `'2'` = Mensagens do Título ⚠️ valor inferido do contexto, não confirmado explicitamente pela tabela do manual
- `'3'` = Envio por E-mail/SMS ⚠️ idem
- `'4'` = Tipo de Pagamento/Rateio ⚠️ idem
- `'9'` = Trailer

## 📚 Fontes

- Manual oficial Caixa: `caixa_layout_CNAB_400_2024.pdf`
