# Registro Tipo 8 — Pagamento via PIX / QR Code (Remessa, opcional)

> Fontes:
> - **Manual oficial Santander** (Santander_Layout-Cobranca-400-posicoes-jul-2025-Portugues.pdf, v2.36) — **confirma todas as 13 posições documentadas abaixo, campo a campo, sem divergências**
> - `brcobranca` (Ruby) — `lib/brcobranca/remessa/cnab400/santander_pix.rb`, método `monta_detalhe_pix`
> - `laravel-boleto` (PHP) — `src/Cnab/Remessa/Cnab400/Banco/Santander.php`, bloco `if ($boleto->validarPix())` (linhas 239-261)
>
> **Nota histórica**: O layout foi inicialmente documentado neste projeto com base em duas bibliotecas de terceiros independentes que concordavam byte a byte, antes do manual oficial jul/2025 estar disponível. O manual antigo do projeto (`CNAB 400 COBRANÇA 2015`, de 10/2009) é anterior ao lançamento do PIX pelo Banco Central (2020), por isso não cobria este registro. O manual atualizado v2.36 confirmou integralmente o layout já documentado.

## O que é

Registro inteiro separado, opcional, adicionado modernamente ao CNAB 400 do Santander para permitir que o boleto tenha também uma opção de pagamento via **PIX com QR Code dinâmico**: o pagador escolhe pagar pelo código de barras tradicional ou escaneando o QR Code, usando uma chave DICT (CPF/CNPJ/telefone/e-mail/aleatória) do beneficiário. Ambas as libs implementam este registro como um **registro extra emitido logo após o detalhe (tipo 1) do título**, só quando o boleto tem PIX habilitado (`boleto.validarPix()` no laravel-boleto; chamada explícita de `monta_detalhe_pix` no brcobranca).

## Regras importantes (manual oficial e fontes de terceiros)

- `tipo_pagamento` controla como o valor pago via PIX pode divergir do valor do boleto: `'00'` = conforme perfil do beneficiário, `'01'` = aceita qualquer valor, `'02'` = aceita entre um valor/percentual mínimo e máximo, `'03'` = não aceita valor divergente (confirmado pelo manual oficial v2.36).
- Quando `tipo_pagamento = '02'`, os campos de valor/percentual mínimo e máximo (posições 7-42) definem a faixa aceita — o `tipo_valor` (posição 6) indica se essa faixa é expressa em valor monetário (`'2'`) ou percentual (`'1'`) (confirmado pelo manual oficial v2.36).
- `tipo_chave_dict` mapeia: `'1'`=CPF, `'2'`=CNPJ, `'3'`=Telefone/Celular, `'4'`=E-mail, `'5'`=Chave Aleatória (confirmado pelo manual oficial v2.36).
- O campo de identificação do QR Code (posição 121-155, chamado `txid` no brcobranca e `getID()` no laravel-boleto) é o identificador único da transação PIX, usado para conciliação (confirmado pelo manual oficial v2.36).
- Ambas as libs colocam este registro **imediatamente após o detalhe tipo 1** do mesmo título, reaproveitando o contador de sequencial de registro do arquivo (`iRegistros + 1`).

## Campos

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `codigo_registro` | [1,1] | num | 1 | 0 | true | `'8'` | Identificação do registro (pagamento PIX) |
| `tipo_pagamento` | [2,3] | num | 2 | 0 | true | `'00'` | `'00'`=conforme perfil do beneficiário, `'01'`=aceita qualquer valor, `'02'`=entre mínimo e máximo, `'03'`=não aceita valor divergente |
| `quantidade_pagamentos` | [4,5] | num | 2 | 0 | true | `'01'` | Quantidade de pagamentos PIX possíveis para o título |
| `tipo_valor` | [6,6] | num | 1 | 0 | true | null | `'1'`=percentual, `'2'`=valor monetário — aplica-se aos campos de mínimo/máximo abaixo |
| `valor_maximo` | [7,19] | num | 13 | 2 | false | null | Valor máximo aceito via PIX (quando `tipo_pagamento='02'`) |
| `percentual_maximo` | [20,24] | num | 5 | 2 | false | null | Percentual máximo aceito via PIX (quando `tipo_pagamento='02'`) |
| `valor_minimo` | [25,37] | num | 13 | 2 | false | null | Valor mínimo aceito via PIX (quando `tipo_pagamento='02'`) |
| `percentual_minimo` | [38,42] | num | 5 | 2 | false | null | Percentual mínimo aceito via PIX (quando `tipo_pagamento='02'`) |
| `tipo_chave_dict` | [43,43] | alfa | 1 | 0 | true | null | `'1'`=CPF, `'2'`=CNPJ, `'3'`=Telefone, `'4'`=E-mail, `'5'`=Chave Aleatória |
| `codigo_chave_dict` | [44,120] | alfa | 77 | 0 | true | null | Valor da chave DICT do beneficiário (CPF/CNPJ/telefone/e-mail/chave aleatória) |
| `identificador_qrcode` | [121,155] | alfa | 35 | 0 | false | null | Identificador/TXID do QR Code, usado para conciliação do pagamento |
| `reservado` | [156,394] | alfa | 239 | 0 | false | null | Reservado para uso do banco |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

## Nenhuma evidência real disponível

O fixture do projeto (`tests/fixtures/cnab400/santander/SANTANDER_cnab_400_140.REM`) **não contém** nenhum registro tipo 8 — só tipos 0, 1 e 9, e é anterior à adoção do PIX. Todas as posições acima foram inicialmente documentadas com base em bibliotecas de terceiros (`brcobranca` em Ruby e `laravel-boleto` em PHP), com **concordância byte a byte entre duas implementações independentes**, e posteriormente **confirmadas integralmente pelo manual oficial do Santander v2.36 (jul/2025)**, validando a exatidão do layout sem nenhuma divergência.
