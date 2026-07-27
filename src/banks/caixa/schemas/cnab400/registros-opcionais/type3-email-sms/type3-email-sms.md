# Registro Tipo 3 — Informações para Envio por E-mail/SMS (Remessa, opcional)

> Fonte: manual oficial Caixa, `caixa_layout_CNAB_400_2024.pdf` (2024). Posições extraídas via `pdftotext -raw` e conferidas por soma (400 bytes exatos, sem gap/sobreposição). Sem confirmação de terceiros — `laravel-boleto` não implementa este registro.

## O que é

Registro inteiro separado, opcional, que informa o **e-mail e/ou celular do pagador** para que o boleto (ou aviso relacionado) seja enviado por e-mail e/ou SMS, em vez de (ou além de) impresso fisicamente. Reaproveita os mesmos campos de identificação da empresa/beneficiário do início do registro tipo 1/tipo 2 (tipo/número de inscrição, agência, código do beneficiário) antes dos dados de contato do destinatário.

## Regras importantes

- `dados_destinatario` (posição 54-103, 50 caracteres) é o campo de e-mail — o manual não especifica um formato/validação além do tamanho.
- `codigo_ddd` + `numero_celular` (posições 104-114) formam o número de celular para envio de SMS, separados do e-mail.
- `tipo_mensagem_sms` (posição 115) tem uma Nota Explicativa própria (NE060) no manual que não foi extraída em detalhe nesta rodada — vale consultar o PDF original antes de implementar lógica que dependa do valor exato desse campo.
- `codigo_registro` (posição 1) não teve o valor fixo `'3'` mostrado explicitamente na tabela extraída — inferido pelo contexto, mesma ressalva do registro tipo 2.

## Campos

| Campo | Posição | Tipo | Tamanho | Obrigatório | Descrição |
| -- | -- | -- | -- | -- | -- |
| `codigo_registro` | [1,1] | num | 1 | true | `'3'` (inferido — ver nota acima) |
| `tipo_inscricao_empresa` | [2,3] | num | 2 | false | `'1'`=CPF, `'2'`=CNPJ |
| `numero_inscricao_empresa` | [4,17] | num | 14 | false | CPF/CNPJ do beneficiário |
| `codigo_agencia` | [18,21] | num | 4 | false | Código da agência de vinculação do beneficiário |
| `codigo_beneficiario` | [22,28] | num | 7 | false | Identificação da empresa na CAIXA |
| `brancos_1` | [29,53] | alfa | 25 | false | Em branco |
| `dados_destinatario` | [54,103] | alfa | 50 | false | E-mail para envio da informação |
| `codigo_ddd` | [104,105] | alfa | 2 | false | DDD do celular do destinatário |
| `numero_celular` | [106,114] | alfa | 9 | false | Número do celular, para envio de SMS |
| `tipo_mensagem_sms` | [115,115] | alfa | 1 | false | Ver Nota Explicativa NE060 no manual (não detalhada nesta extração) |
| `brancos_2` | [116,394] | alfa | 279 | false | Em branco |
| `numero_sequencial` | [395,400] | num | 6 | true | Número sequencial do registro no arquivo |

Total: 400 posições, conferido (soma exata, sem gap/sobreposição).

## Nenhuma evidência real disponível

Não há fixture real ou sintética de CNAB 400 Caixa no projeto, e `laravel-boleto` não implementa este registro. Todas as posições vêm exclusivamente do manual oficial de 2024.
