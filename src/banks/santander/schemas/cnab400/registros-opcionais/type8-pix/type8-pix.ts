/**
 * Santander (033) — CNAB 400 — Registro Tipo 8 (Pagamento via PIX/QR Code)
 *
 * Registro opcional que permite que o boleto tenha também uma opção de pagamento via
 * PIX com QR Code dinâmico: o pagador escolhe pagar pelo código de barras tradicional
 * ou escaneando o QR Code, usando uma chave DICT (CPF/CNPJ/telefone/e-mail/aleatória)
 * do beneficiário.
 *
 * Fontes:
 * - Manual oficial Santander (v2.36, jul/2025) — confirma todas as 13 posições
 *   documentadas, campo a campo, sem divergências
 * - brcobranca (Ruby) — remessa/cnab400/santander_pix.rb
 * - laravel-boleto (PHP) — Cnab/Remessa/Cnab400/Banco/Santander.php
 *
 * PARTICULARIDADES:
 * - tipo_pagamento controla como o valor pago via PIX pode divergir do valor do boleto:
 *   '00'=conforme perfil beneficiário, '01'=aceita qualquer valor, '02'=entre min/max,
 *   '03'=não aceita valor divergente
 * - Quando tipo_pagamento='02', os campos de valor/percentual min/max definem a faixa
 *   aceita; tipo_valor indica se é valor monetário ('2') ou percentual ('1')
 * - tipo_chave_dict: '1'=CPF, '2'=CNPJ, '3'=Telefone, '4'=E-mail, '5'=Chave Aleatória
 * - identificador_qrcode é o TXID do QR Code, usado para conciliação do pagamento
 * - Este registro é emitido imediatamente após o detalhe (tipo 1) do título
 */

import { RecordSchema } from '../../../../../../types'

export const TYPE8_PIX: RecordSchema = {
  codigo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '8',
    description: 'Identificação do registro (pagamento PIX)',
    canonical: null,
  },
  tipo_pagamento: {
    pos: [2, 3],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '00',
    description:
      "Tipo de pagamento: 00=conforme perfil do beneficiário, 01=aceita qualquer valor, 02=entre mínimo e máximo, 03=não aceita valor divergente",
    canonical: null,
  },
  quantidade_pagamentos: {
    pos: [4, 5],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '01',
    description: 'Quantidade de pagamentos PIX possíveis para o título',
    canonical: null,
  },
  tipo_valor: {
    pos: [6, 6],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description:
      'Tipo de valor: 1=percentual, 2=valor monetário — aplica-se aos campos de mínimo/máximo',
    canonical: null,
  },
  valor_maximo: {
    pos: [7, 19],
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: "Valor máximo aceito via PIX (quando tipo_pagamento='02')",
    canonical: null,
  },
  percentual_maximo: {
    pos: [20, 24],
    type: 'num',
    size: 5,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: "Percentual máximo aceito via PIX (quando tipo_pagamento='02')",
    canonical: null,
  },
  valor_minimo: {
    pos: [25, 37],
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: "Valor mínimo aceito via PIX (quando tipo_pagamento='02')",
    canonical: null,
  },
  percentual_minimo: {
    pos: [38, 42],
    type: 'num',
    size: 5,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: "Percentual mínimo aceito via PIX (quando tipo_pagamento='02')",
    canonical: null,
  },
  tipo_chave_dict: {
    pos: [43, 43],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description:
      'Tipo de chave DICT: 1=CPF, 2=CNPJ, 3=Telefone, 4=E-mail, 5=Chave Aleatória',
    canonical: null,
  },
  codigo_chave_dict: {
    pos: [44, 120],
    type: 'alfa',
    size: 77,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description:
      'Valor da chave DICT do beneficiário (CPF/CNPJ/telefone/e-mail/chave aleatória)',
    canonical: null,
  },
  identificador_qrcode: {
    pos: [121, 155],
    type: 'alfa',
    size: 35,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Identificador/TXID do QR Code, usado para conciliação do pagamento',
    canonical: null,
  },
  reservado: {
    pos: [156, 394],
    type: 'alfa',
    size: 239,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado para uso do banco',
    canonical: null,
  },
  numero_sequencial: {
    pos: [395, 400],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Sequencial do registro no arquivo',
    canonical: null,
  },
}
