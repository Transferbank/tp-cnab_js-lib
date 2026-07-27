# Completude dos Schemas CNAB 240 Bradesco

## Resumo das alterações

Este documento descreve as alterações feitas nos Segmentos P e Q para completá-los com todos os campos definidos no padrão CNAB 240 do Bradesco.

## Segmento P - Dados financeiros do título

### Antes
O Segmento P tinha **apenas 5 campos** implementados:
- `controle_banco` (1-3)
- `controle_registro` (8-8)
- `servico_segmento` (14-14)
- `vencimento_titulo` (78-85)
- `valor_titulo` (86-100)

### Depois
O Segmento P agora possui **42 campos completos**, cobrindo 100% das posições 1-240:

#### Campos de controle (1-17)
- `controle_banco` (1-3): Código FEBRABAN do Bradesco (237)
- `controle_lote` (4-7): Lote de serviço
- `controle_registro` (8-8): Tipo de registro (3=Detalhe)
- `servico_numero_registro` (9-13): Número sequencial do registro no lote
- `servico_segmento` (14-14): Identificador do segmento (P)
- `cnab_exclusivo_1` (15-15): Uso exclusivo FEBRABAN/CNAB
- `servico_codigo_movimento` (16-17): Código de movimento da remessa

#### Dados do cedente (18-37)
- `cedente_agencia` (18-22): Agência do cedente
- `cedente_agencia_dv` (23-23): Dígito verificador da agência
- `cedente_conta` (24-35): Conta corrente do cedente
- `cedente_conta_dv` (36-36): Dígito verificador da conta
- `cnab_exclusivo_2` (37-37): Uso exclusivo FEBRABAN/CNAB

#### Identificação do título (38-77)
- `identificacao_titulo_banco` (38-57): Identificação completa no banco (carteira + nosso número)
- `cobranca_carteira` (58-58): Código da carteira (1=Simples, 3=Caucionada, 4=Descontada)
- `cobranca_cadastramento` (59-59): Forma de cadastramento (0=Com registro, 1=Sem registro)
- `cobranca_documento_tipo` (60-60): Tipo de documento
- `cobranca_emissao_bloqueto` (61-61): Identificação da emissão (1=Banco, 2=Empresa)
- `cobranca_distribuicao_bloqueto` (62-62): Identificação da distribuição
- `numero_documento` (63-77): Número do documento de cobrança

#### Valores e datas (78-195)
- `vencimento_titulo` (78-85): Data de vencimento
- `valor_titulo` (86-100): Valor do título
- `agencia_cobradora` (101-105): Agência cobradora/recebedora
- `agencia_cobradora_dv` (106-106): Dígito verificador da agência cobradora
- `especie_titulo` (107-108): Espécie do título (01=DM, 02=NP, etc.)
- `aceite_titulo` (109-109): Aceite (A=Aceite, N=Não aceite)
- `data_emissao_titulo` (110-117): Data de emissão do título

#### Juros (118-141)
- `juros_codigo` (118-118): Código de juros (0=Isento, 1=Valor/dia, 2=Taxa mensal)
- `juros_data` (119-126): Data de início da cobrança de juros
- `juros_valor` (127-141): Valor ou taxa de juros

#### Desconto (142-165)
- `desconto1_codigo` (142-142): Código do primeiro desconto
- `desconto1_data` (143-150): Data limite para primeiro desconto
- `desconto1_valor` (151-165): Valor ou percentual do primeiro desconto

#### Outros valores (166-195)
- `valor_iof` (166-180): Valor do IOF
- `valor_abatimento` (181-195): Valor do abatimento

#### Identificação e instruções (196-240)
- `identificacao_titulo_empresa` (196-220): Identificação do título na empresa
- `codigo_protesto` (221-221): Código para protesto
- `prazo_protesto` (222-223): Número de dias para protesto
- `codigo_baixa` (224-224): Código para baixa/devolução
- `prazo_baixa` (225-227): Número de dias para baixa/devolução
- `codigo_moeda` (228-229): Código da moeda (09=Real)
- `numero_contrato` (230-239): Número do contrato da operação de crédito
- `cnab_exclusivo_3` (240-240): Uso exclusivo FEBRABAN/CNAB

## Segmento Q - Dados do sacado/pagador

### Antes
O Segmento Q tinha **11 campos** implementados, com um gap importante no endereço (faltava o bairro):
- Campos de controle básicos (banco, registro, segmento)
- Dados do sacado (tipo, número, nome, endereço)
- CEP (separado em prefixo e sufixo)
- Cidade e UF

### Depois
O Segmento Q agora possui **22 campos completos**, cobrindo 100% das posições 1-240:

#### Campos de controle (1-17)
- `controle_banco` (1-3): Código FEBRABAN do Bradesco (237)
- `controle_lote` (4-7): Lote de serviço
- `controle_registro` (8-8): Tipo de registro (3=Detalhe)
- `servico_numero_registro` (9-13): Número sequencial do registro no lote
- `servico_segmento` (14-14): Identificador do segmento (Q)
- `cnab_exclusivo_1` (15-15): Uso exclusivo FEBRABAN/CNAB
- `servico_codigo_movimento` (16-17): Código de movimento da remessa

#### Dados do sacado/pagador (18-153)
- `sacado_inscricao_tipo` (18-18): Tipo de inscrição (1=CPF, 2=CNPJ)
- `sacado_inscricao_numero` (19-33): CPF ou CNPJ
- `sacado_nome` (34-73): Nome do pagador
- `sacado_endereco` (74-113): Endereço
- `sacado_bairro` (114-128): **NOVO** - Bairro (campo que estava faltando)
- `sacado_cep` (129-133): CEP (5 dígitos)
- `sacado_cep_sufixo` (134-136): CEP sufixo
- `sacado_cidade` (137-151): Cidade
- `sacado_uf` (152-153): UF

#### Dados do Beneficiário Final (154-209)
- `beneficiario_final_inscricao_tipo` (154-154): **NOVO** - Tipo de inscrição do Beneficiário Final
- `beneficiario_final_inscricao_numero` (155-169): **NOVO** - CPF ou CNPJ do Beneficiário Final
- `beneficiario_final_nome` (170-209): **NOVO** - Nome do Beneficiário Final

> Renomeado de "sacador/avalista" para "Beneficiário Final" — nomenclatura BACEN (Circulares 3598, 3656, 3956) confirmada pelo manual 2024.

#### Banco correspondente (210-232)
- `banco_correspondente` (210-212): **NOVO** - Código do banco correspondente
- `numero_banco_correspondente` (213-232): **NOVO** - Nosso número no banco correspondente

#### Campos CNAB (233-240)
- `cnab_exclusivo_2` (233-240): **NOVO** - Uso exclusivo FEBRABAN/CNAB

## Fonte dos dados

Todos os campos e posições foram validados contra:

1. **pycnab240** (`python-cnab-master3/cnab240/bancos/bradesco/specs/`)
   - `segmento_p.json`: 42 campos validados
   - `segmento_q.json`: 22 campos validados

2. **laravel-boleto** (PHP)
   - Implementação independente que concorda 100% nas posições

   - Análise detalhada confirmando que não há divergências de posicionamento entre as fontes
   - Validação contra o manual oficial do Bradesco

## Padrões seguidos

- **Nomenclatura**: Português com underscores (padrão do projeto)
- **Formato de datas**: `'DDMMAAAA'` para CNAB 240
- **Valores monetários**: `decimais: 2`
- **Código do banco**: `padrao: '237'` (Bradesco)
- **Campos CNAB**: Marcados como `obrigatorio: false` e `padrao: ''`
- **Descrições**: Em português, claras e diretas

## Validação

Todos os 75 testes continuam passando após as alterações:
- ✅ Testes de metadados (3)
- ✅ Testes de header (9)
- ✅ Testes de segmento P (9)
- ✅ Testes de segmento Q (19)
- ✅ Testes de segmento R (21)
- ✅ Testes de trailer (3)
- ✅ Testes de integração (5)
- ✅ Testes de integridade (6)

## Campos CNAB exclusivos

Os campos marcados como "Uso exclusivo FEBRABAN/CNAB" são áreas reservadas pelo padrão para uso interno do sistema bancário. Geralmente devem ser preenchidos com espaços em branco ou zeros, dependendo do tipo.

## Observação sobre granularidade

O campo `identificacao_titulo_banco` (38-57) é mantido como um campo único de 20 posições, conforme o pycnab240. O laravel-boleto decompõe essa faixa em:
- Carteira/Produto (38-40)
- Reservado/Zeros (41-45)  
- Nosso Número (46-57)

Ambas as abordagens são válidas. Mantivemos o campo único para simplicidade, mas a aplicação pode fazer a decomposição internamente se necessário.

## Próximos passos

Com os Segmentos P e Q completos, a implementação do CNAB 240 Bradesco para remessa possui:
- ✅ Header de Arquivo (parcial)
- ✅ Segmento P (completo - 42 campos)
- ✅ Segmento Q (completo - 22 campos)
- ✅ Segmento R (completo - 29 campos)
- ✅ Trailer de Arquivo (parcial)

Ainda podem ser implementados no futuro:
- Header de Lote de Cobrança
- Trailer de Lote de Cobrança
- Campos adicionais do Header de Arquivo (dados do cedente)
- Campos adicionais do Trailer de Arquivo (totalizadores)
