/**
 * Testes básicos dos segmentos adicionais - Sicredi CNAB 240
 * 
 * Valida a integridade estrutural dos segmentos R, S, Y-01 e Y-04
 */

import { extractLineFields } from '@parser/field-extractor'
import {
  SICREDI_CNAB240_SEGMENT_R,
  SICREDI_CNAB240_SEGMENT_S_FRONT_BACK,
  SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS,
  SICREDI_CNAB240_SEGMENT_Y01,
  SICREDI_CNAB240_SEGMENT_Y04,
  parseSegmentS,
  identifySegmentSVariant,
} from '@banks/sicredi/schemas/cnab240'

describe('Schema Sicredi CNAB 240 - Segmentos Adicionais', () => {
  describe('Segmento R (Descontos 2/3 e Multa)', () => {
    it('deve ter código do banco na posição 1-3 com padrão "748"', () => {
      expect(SICREDI_CNAB240_SEGMENT_R.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      expect(SICREDI_CNAB240_SEGMENT_R.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '3',
      })
    })

    it('deve ter identificador do segmento "R" na posição 14', () => {
      expect(SICREDI_CNAB240_SEGMENT_R.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'R',
      })
    })

    it('deve ter código de movimento VARIÁVEL (não fixo) na posição 16-17', () => {
      const campo = SICREDI_CNAB240_SEGMENT_R.servico_codigo_movimento
      expect(campo.pos).toEqual([16, 17])
      expect(campo.pattern).toBeNull() // variável, não fixo
    })

    it('deve ter campos de desconto 2 nas posições 18-41', () => {
      expect(SICREDI_CNAB240_SEGMENT_R.desconto2_codigo.pos).toEqual([18, 18])
      expect(SICREDI_CNAB240_SEGMENT_R.desconto2_data.pos).toEqual([19, 26])
      expect(SICREDI_CNAB240_SEGMENT_R.desconto2_valor.pos).toEqual([27, 41])
    })

    it('deve ter campos de desconto 3 nas posições 42-65', () => {
      expect(SICREDI_CNAB240_SEGMENT_R.desconto3_codigo.pos).toEqual([42, 42])
      expect(SICREDI_CNAB240_SEGMENT_R.desconto3_data.pos).toEqual([43, 50])
      expect(SICREDI_CNAB240_SEGMENT_R.desconto3_valor.pos).toEqual([51, 65])
    })

    it('deve ter campos de multa nas posições 66-89', () => {
      expect(SICREDI_CNAB240_SEGMENT_R.multa_codigo.pos).toEqual([66, 66])
      expect(SICREDI_CNAB240_SEGMENT_R.multa_data.pos).toEqual([67, 74])
      expect(SICREDI_CNAB240_SEGMENT_R.multa_valor.pos).toEqual([75, 89])
    })

    it('deve marcar posições 90-240 como não utilizadas pelo Sicredi', () => {
      expect(SICREDI_CNAB240_SEGMENT_R.cnab_exclusivo_2.pos).toEqual([90, 99])
      expect(SICREDI_CNAB240_SEGMENT_R.cnab_exclusivo_2.description).toContain(
        'usado',
      )
    })
  })

  describe('Segmento S (Mensagens)', () => {
    describe('Variante Frente/Verso', () => {
      it('deve ter código do banco na posição 1-3 com padrão "748"', () => {
        expect(
          SICREDI_CNAB240_SEGMENT_S_FRONT_BACK.controle_banco,
        ).toMatchObject({
          pos: [1, 3],
          pattern: '748',
        })
      })

      it('deve ter identificador do segmento "S" na posição 14', () => {
        expect(
          SICREDI_CNAB240_SEGMENT_S_FRONT_BACK.servico_segmento,
        ).toMatchObject({
          pos: [14, 14],
          pattern: 'S',
        })
      })

      it('deve ter tipo de impressão na posição 18', () => {
        expect(
          SICREDI_CNAB240_SEGMENT_S_FRONT_BACK.tipo_impressao.pos,
        ).toEqual([18, 18])
      })

      it('deve ter número da linha na posição 19-20', () => {
        expect(SICREDI_CNAB240_SEGMENT_S_FRONT_BACK.numero_linha.pos).toEqual(
          [19, 20],
        )
      })

      it('deve ter mensagem de 80 caracteres na posição 21-100', () => {
        expect(SICREDI_CNAB240_SEGMENT_S_FRONT_BACK.mensagem.pos).toEqual([
          21, 100,
        ])
        expect(SICREDI_CNAB240_SEGMENT_S_FRONT_BACK.mensagem.size).toBe(80)
      })
    })

    describe('Variante Corpo de Instruções', () => {
      it('deve ter 3 mensagens de tamanhos diferentes', () => {
        expect(
          SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS.mensagem_1.pos,
        ).toEqual([21, 58])
        expect(
          SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS.mensagem_1.size,
        ).toBe(38)

        expect(
          SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS.mensagem_2.pos,
        ).toEqual([59, 98])
        expect(
          SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS.mensagem_2.size,
        ).toBe(40)

        expect(
          SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS.mensagem_3.pos,
        ).toEqual([99, 138])
        expect(
          SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS.mensagem_3.size,
        ).toBe(40)
      })

      it('deve marcar posições 219-240 como não documentadas explicitamente', () => {
        expect(
          SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS.cnab_exclusivo_4.pos,
        ).toEqual([219, 240])
        expect(
          SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS.cnab_exclusivo_4.description,
        ).toContain('documentado')
      })
    })

    describe('Helper de identificação', () => {
      it('deve identificar variante frente/verso para tipo 1', () => {
        // pos 1-3: banco, 4-7: lote, 8: tipo registro '3', 9-13: num registro, 14: segmento 'S', 15: cnab, 16-17: movimento, 18: tipo impressão
        const line =
          '748' + '0001' + '3' + '00001' + 'S' + ' ' + '01' + '1' + ' '.repeat(222)
        const variant = identifySegmentSVariant(line)
        expect(variant).toBe('frente_verso')
      })

      it('deve identificar variante frente/verso para tipo 2', () => {
        const line =
          '748' + '0001' + '3' + '00001' + 'S' + ' ' + '01' + '2' + ' '.repeat(222)
        const variant = identifySegmentSVariant(line)
        expect(variant).toBe('frente_verso')
      })

      it('deve identificar variante corpo de instruções para tipo 3', () => {
        const line =
          '748' + '0001' + '3' + '00001' + 'S' + ' ' + '01' + '3' + ' '.repeat(222)
        const variant = identifySegmentSVariant(line)
        expect(variant).toBe('corpo_instrucoes')
      })

      it('deve retornar erro para tipo de impressão inválido', () => {
        const line =
          '748' + '0001' + '3' + '00001' + 'S' + ' ' + '01' + '9' + ' '.repeat(222)
        const variant = identifySegmentSVariant(line)
        expect(variant).toHaveProperty('error')
      })
    })
  })

  describe('Segmento Y-01 (Beneficiário Final)', () => {
    it('deve ter código do banco na posição 1-3 com padrão "748"', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y01.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter identificador do segmento "Y" na posição 14', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y01.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'Y',
      })
    })

    it('deve ter código de registro "01" na posição 18-19', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y01.codigo_registro).toMatchObject({
        pos: [18, 19],
        pattern: '01',
      })
    })

    it('deve ter tipo de pessoa do beneficiário final na posição 20', () => {
      expect(
        SICREDI_CNAB240_SEGMENT_Y01.beneficiario_final_tipo_pessoa.pos,
      ).toEqual([20, 20])
    })

    it('deve ter CPF/CNPJ do beneficiário final na posição 21-35', () => {
      expect(
        SICREDI_CNAB240_SEGMENT_Y01.beneficiario_final_cpf_cnpj.pos,
      ).toEqual([21, 35])
    })

    it('deve ter nome do beneficiário final na posição 36-75', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y01.beneficiario_final_nome.pos).toEqual([
        36, 75,
      ])
      expect(SICREDI_CNAB240_SEGMENT_Y01.beneficiario_final_nome.size).toBe(
        40,
      )
    })

    it('deve ter CEP de 8 dígitos na posição 131-138', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y01.beneficiario_final_cep.pos).toEqual([
        131, 138,
      ])
      expect(SICREDI_CNAB240_SEGMENT_Y01.beneficiario_final_cep.size).toBe(8)
    })

    it('deve usar nomenclatura "Beneficiário Final" (não Sacador/Avalista)', () => {
      const nomesCampos = Object.keys(SICREDI_CNAB240_SEGMENT_Y01)
      const temBeneficiarioFinal = nomesCampos.some((nome) =>
        nome.includes('beneficiario_final'),
      )
      const temSacadorAvalista = nomesCampos.some(
        (nome) => nome.includes('sacador') || nome.includes('avalista'),
      )
      expect(temBeneficiarioFinal).toBe(true)
      expect(temSacadorAvalista).toBe(false)
    })
  })

  describe('Segmento Y-04 (PIX/QR Code)', () => {
    it('deve ter código do banco na posição 1-3 com padrão "748"', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter identificador do segmento "Y" na posição 14', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'Y',
      })
    })

    it('deve ter código de registro "04" na posição 18-19', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.codigo_registro).toMatchObject({
        pos: [18, 19],
        pattern: '04',
      })
    })

    it('deve ter tipo de chave PIX na posição 81', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.pix_tipo_chave.pos).toEqual([81, 81])
    })

    it('deve ter chave PIX de 77 caracteres na posição 82-158', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.pix_chave.pos).toEqual([82, 158])
      expect(SICREDI_CNAB240_SEGMENT_Y04.pix_chave.size).toBe(77)
    })

    it('deve ter TXID do PIX de 35 caracteres na posição 159-193', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.pix_txid.pos).toEqual([159, 193])
      expect(SICREDI_CNAB240_SEGMENT_Y04.pix_txid.size).toBe(35)
    })

    it('tipo de chave deve mencionar que Sicredi não valida', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.pix_tipo_chave.description).toContain(
        'valida',
      )
    })

    it('chave PIX deve mencionar que é gerada pelo Sicredi', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.pix_chave.description).toContain(
        'gerada pelo Sicredi',
      )
    })

    it('TXID deve mencionar que Sicredi gera e vincula ao título', () => {
      expect(SICREDI_CNAB240_SEGMENT_Y04.pix_txid.description).toContain(
        'Sicredi gera',
      )
    })
  })

  describe('Integração - Parsing sintético', () => {
    it('deve parsear Segmento R com descontos e multa', () => {
      const line =
        '748' + // banco (3)
        '0001' + // lote (4)
        '3' + // tipo registro (1)
        '00001' + // num registro (5)
        'R' + // segmento (1)
        ' ' + // cnab (1)
        '01' + // movimento (2) = 17 chars até aqui
        '1' + // desconto2_codigo (1) = 18
        '31122024' + // desconto2_data (8) = 26
        '000000000010000' + // desconto2_valor (15) = 41
        '2' + // desconto3_codigo (1) = 42
        '31012025' + // desconto3_data (8) = 50
        '000000000005000' + // desconto3_valor (15) = 65
        '1' + // multa_codigo (1) = 66
        '01012025' + // multa_data (8) = 74
        '000000000002000' + // multa_valor (15) = 89
        ' '.repeat(151) // resto até 240

      expect(line.length).toBe(240)
      const parsed = extractLineFields(line, SICREDI_CNAB240_SEGMENT_R)
      expect(parsed.controle_banco.value).toBe(748)
      expect(parsed.servico_segmento.value).toBe('R')
      expect(parsed.desconto2_codigo.value).toBe(1)
      expect(parsed.desconto2_valor.value).toBe(100.0)
      expect(parsed.multa_valor.value).toBe(20.0)
    })

    it('deve parsear Segmento S variante frente/verso', () => {
      const line =
        '748' + // banco (3)
        '0001' + // lote (4)
        '3' + // tipo registro (1)
        '00002' + // num registro (5)
        'S' + // segmento (1)
        ' ' + // cnab (1)
        '01' + // movimento (2) = 17 chars
        '1' + // tipo impressão (1) = 18
        '01' + // numero_linha (2) = 20
        'Mensagem de teste para o boleto'.padEnd(80, ' ') + // mensagem (80) = 100
        ' '.repeat(140) // resto até 240

      expect(line.length).toBe(240)
      const parsed = parseSegmentS(line)
      expect(parsed.controle_banco.value).toBe(748)
      expect(parsed.servico_segmento.value).toBe('S')
      expect(parsed.tipo_impressao.value).toBe(1)
      expect(parsed.numero_linha.value).toBe(1)
      expect(parsed.mensagem.value).toContain('Mensagem de teste')
    })

    it('deve parsear Segmento Y-01 com Beneficiário Final', () => {
      const line =
        '748' + // banco (3)
        '0001' + // lote (4)
        '3' + // tipo registro (1)
        '00003' + // num registro (5)
        'Y' + // segmento (1)
        ' ' + // cnab (1)
        '01' + // movimento (2) = 17 chars
        '01' + // código registro (2) = 19
        '1' + // tipo_pessoa (1) = 20
        '000123456789012' + // cpf_cnpj (15) = 35
        'JOAO DA SILVA'.padEnd(40, ' ') + // nome (40) = 75
        'RUA TESTE 123'.padEnd(40, ' ') + // endereco (40) = 115
        ' '.repeat(15) + // cnab_exclusivo (15) = 130
        '12345678' + // cep (8) = 138
        'SAO PAULO'.padEnd(15, ' ') + // cidade (15) = 153
        'SP' + // uf (2) = 155
        ' '.repeat(85) // cnab_exclusivo (85) até 240

      expect(line.length).toBe(240)
      const parsed = extractLineFields(line, SICREDI_CNAB240_SEGMENT_Y01)
      expect(parsed.controle_banco.value).toBe(748)
      expect(parsed.servico_segmento.value).toBe('Y')
      expect(parsed.codigo_registro.value).toBe(1)
      expect(parsed.beneficiario_final_tipo_pessoa.value).toBe(1)
      expect(parsed.beneficiario_final_nome.value).toContain('JOAO DA SILVA')
      expect(parsed.beneficiario_final_cep.value).toBe(12345678)
    })

    it('deve parsear Segmento Y-04 com dados PIX', () => {
      const line =
        '748' + // banco (3)
        '0001' + // lote (4)
        '3' + // tipo registro (1)
        '00004' + // num registro (5)
        'Y' + // segmento (1)
        ' ' + // cnab (1)
        '01' + // movimento (2) = 17 chars
        '04' + // código registro (2) = 19
        ' '.repeat(50) + // cnab_exclusivo_2 (50) = 69
        '00' + // cnab_exclusivo_3 (2) = 71
        ' '.repeat(9) + // cnab_exclusivo_4 (9) = 80
        ' ' + // pix_tipo_chave (1) = 81
        'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'.padEnd(
          77,
          ' ',
        ) + // chave PIX (77) = 158
        'TXID1234567890ABCDEF'.padEnd(35, ' ') + // txid (35) = 193
        ' '.repeat(47) // cnab_exclusivo (47) até 240

      expect(line.length).toBe(240)
      const parsed = extractLineFields(line, SICREDI_CNAB240_SEGMENT_Y04)
      expect(parsed.controle_banco.value).toBe(748)
      expect(parsed.servico_segmento.value).toBe('Y')
      expect(parsed.codigo_registro.value).toBe(4)
      expect(parsed.pix_chave.value).toContain('abc123')
      expect(parsed.pix_txid.value).toContain('TXID1234')
    })
  })
})
