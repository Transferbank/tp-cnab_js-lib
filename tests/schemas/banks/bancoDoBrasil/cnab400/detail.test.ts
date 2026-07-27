/**
 * Testes do Schema Banco do Brasil CNAB 400 - Detalhe (Registro Tipo 7)
 *
 * PARTICULARIDADE DO BB: tipo_registro = '7' (não '1' como padrão FEBRABAN)
 *
 * Parte 1: Definição dos campos (validação da estrutura do schema)
 * Parte 2: Parsing de arquivo real
 */

import { bancoDoBrasilCnab400 } from '../../../../../src/banks/bancoDoBrasil/schemas/cnab400'
import { extractLineFields } from '../../../../../src/parser/field-extractor'
import * as fs from 'fs'
import * as path from 'path'

function readFixture(filename: string): string[] {
  const fixturePath = path.join(__dirname, '../../../../fixtures/cnab400/bancodobrasil', filename)
  const content = fs.readFileSync(fixturePath, 'latin1')
  return content.split(/\r?\n/).filter((line) => line.trim().length > 0)
}

describe('Schema Banco do Brasil CNAB 400 - Detalhe (Registro Tipo 7)', () => {
  const detail = bancoDoBrasilCnab400.detail!

  describe('Definição dos campos', () => {
    test('deve ter tipo de registro "7" (detalhe) na posição 1', () => {
      expect(detail.tipo_registro).toBeDefined()
      expect(detail.tipo_registro.pos).toEqual([1, 1])
      expect(detail.tipo_registro.type).toBe('num')
      expect(detail.tipo_registro.size).toBe(1)
      expect(detail.tipo_registro.pattern).toBe('7')
    })

    test('deve ter código de inscrição do cedente na posição 2-3', () => {
      expect(detail.codigo_inscricao_cedente).toBeDefined()
      expect(detail.codigo_inscricao_cedente.pos).toEqual([2, 3])
      expect(detail.codigo_inscricao_cedente.type).toBe('num')
      expect(detail.codigo_inscricao_cedente.size).toBe(2)
    })

    test('deve ter número de inscrição do cedente na posição 4-17', () => {
      expect(detail.numero_inscricao_cedente).toBeDefined()
      expect(detail.numero_inscricao_cedente.pos).toEqual([4, 17])
      expect(detail.numero_inscricao_cedente.type).toBe('num')
      expect(detail.numero_inscricao_cedente.size).toBe(14)
    })

    test('deve ter agência na posição 18-21', () => {
      expect(detail.agencia).toBeDefined()
      expect(detail.agencia.pos).toEqual([18, 21])
      expect(detail.agencia.type).toBe('num')
      expect(detail.agencia.size).toBe(4)
      expect(detail.agencia.required).toBe(true)
    })

    test('deve ter conta na posição 23-30', () => {
      expect(detail.conta).toBeDefined()
      expect(detail.conta.pos).toEqual([23, 30])
      expect(detail.conta.type).toBe('num')
      expect(detail.conta.size).toBe(8)
      expect(detail.conta.required).toBe(true)
    })

    test('deve ter convênio na posição 32-38', () => {
      expect(detail.convenio).toBeDefined()
      expect(detail.convenio.pos).toEqual([32, 38])
      expect(detail.convenio.type).toBe('num')
      expect(detail.convenio.size).toBe(7)
      expect(detail.convenio.required).toBe(true)
    })

    test('deve ter nosso número na posição 64-80', () => {
      expect(detail.nosso_numero).toBeDefined()
      expect(detail.nosso_numero.pos).toEqual([64, 80])
      expect(detail.nosso_numero.type).toBe('num')
      expect(detail.nosso_numero.size).toBe(17)
      expect(detail.nosso_numero.required).toBe(true)
    })

    test('deve ter número da carteira na posição 107-108', () => {
      expect(detail.numero_carteira).toBeDefined()
      expect(detail.numero_carteira.pos).toEqual([107, 108])
      expect(detail.numero_carteira.type).toBe('num')
      expect(detail.numero_carteira.size).toBe(2)
      expect(detail.numero_carteira.required).toBe(true)
    })

    test('deve ter comando na posição 109-110', () => {
      expect(detail.comando).toBeDefined()
      expect(detail.comando.pos).toEqual([109, 110])
      expect(detail.comando.type).toBe('num')
      expect(detail.comando.size).toBe(2)
      expect(detail.comando.required).toBe(true)
    })

    test('deve ter número do documento na posição 111-120', () => {
      expect(detail.numero_documento).toBeDefined()
      expect(detail.numero_documento.pos).toEqual([111, 120])
      expect(detail.numero_documento.type).toBe('alfa')
      expect(detail.numero_documento.size).toBe(10)
    })

    test('deve ter vencimento na posição 121-126 com formato DDMMAA', () => {
      expect(detail.vencimento).toBeDefined()
      expect(detail.vencimento.pos).toEqual([121, 126])
      expect(detail.vencimento.type).toBe('data')
      expect(detail.vencimento.size).toBe(6)
      expect(detail.vencimento.dateFormat).toBe('DDMMAA')
      expect(detail.vencimento.required).toBe(true)
    })

    test('deve ter valor do título na posição 127-139 com 2 decimais', () => {
      expect(detail.valor_titulo).toBeDefined()
      expect(detail.valor_titulo.pos).toEqual([127, 139])
      expect(detail.valor_titulo.type).toBe('num')
      expect(detail.valor_titulo.size).toBe(13)
      expect(detail.valor_titulo.decimals).toBe(2)
      expect(detail.valor_titulo.required).toBe(true)
    })

    test('deve ter espécie na posição 148-149', () => {
      expect(detail.especie).toBeDefined()
      expect(detail.especie.pos).toEqual([148, 149])
      expect(detail.especie.type).toBe('num')
      expect(detail.especie.size).toBe(2)
      expect(detail.especie.required).toBe(true)
    })

    test('deve ter aceite na posição 150', () => {
      expect(detail.aceite).toBeDefined()
      expect(detail.aceite.pos).toEqual([150, 150])
      expect(detail.aceite.type).toBe('alfa')
      expect(detail.aceite.size).toBe(1)
      expect(detail.aceite.pattern).toBe('N')
    })

    test('deve ter data de emissão na posição 151-156 com formato DDMMAA', () => {
      expect(detail.data_emissao).toBeDefined()
      expect(detail.data_emissao.pos).toEqual([151, 156])
      expect(detail.data_emissao.type).toBe('data')
      expect(detail.data_emissao.dateFormat).toBe('DDMMAA')
      expect(detail.data_emissao.required).toBe(true)
    })

    test('deve ter código de inscrição do sacado na posição 219-220', () => {
      expect(detail.sacado_codigo_inscricao).toBeDefined()
      expect(detail.sacado_codigo_inscricao.pos).toEqual([219, 220])
      expect(detail.sacado_codigo_inscricao.type).toBe('num')
      expect(detail.sacado_codigo_inscricao.size).toBe(2)
      expect(detail.sacado_codigo_inscricao.required).toBe(true)
    })

    test('deve ter número de inscrição do sacado na posição 221-234', () => {
      expect(detail.sacado_numero_inscricao).toBeDefined()
      expect(detail.sacado_numero_inscricao.pos).toEqual([221, 234])
      expect(detail.sacado_numero_inscricao.type).toBe('num')
      expect(detail.sacado_numero_inscricao.size).toBe(14)
      expect(detail.sacado_numero_inscricao.required).toBe(true)
    })

    test('deve ter nome do sacado na posição 235-271 (37 caracteres)', () => {
      expect(detail.nome).toBeDefined()
      expect(detail.nome.pos).toEqual([235, 271])
      expect(detail.nome.type).toBe('alfa')
      expect(detail.nome.size).toBe(37)
      expect(detail.nome.required).toBe(true)
    })

    test('deve ter logradouro na posição 275-314', () => {
      expect(detail.logradouro).toBeDefined()
      expect(detail.logradouro.pos).toEqual([275, 314])
      expect(detail.logradouro.type).toBe('alfa')
      expect(detail.logradouro.size).toBe(40)
    })

    test('deve ter CEP na posição 327-334', () => {
      expect(detail.cep).toBeDefined()
      expect(detail.cep.pos).toEqual([327, 334])
      expect(detail.cep.type).toBe('num')
      expect(detail.cep.size).toBe(8)
    })

    test('deve ter cidade na posição 335-349', () => {
      expect(detail.cidade).toBeDefined()
      expect(detail.cidade.pos).toEqual([335, 349])
      expect(detail.cidade.type).toBe('alfa')
      expect(detail.cidade.size).toBe(15)
    })

    test('deve ter estado na posição 350-351', () => {
      expect(detail.estado).toBeDefined()
      expect(detail.estado.pos).toEqual([350, 351])
      expect(detail.estado.type).toBe('alfa')
      expect(detail.estado.size).toBe(2)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(detail.numero_sequencial).toBeDefined()
      expect(detail.numero_sequencial.pos).toEqual([395, 400])
      expect(detail.numero_sequencial.type).toBe('num')
      expect(detail.numero_sequencial.size).toBe(6)
      expect(detail.numero_sequencial.required).toBe(true)
    })
  })

  describe('Parsing de arquivo real', () => {
    const lines = readFixture('BANCOBRASIL_cnab_400.REM')
    // Filtrar apenas registros tipo 7 (detalhe)
    const detailLines = lines.filter((line) => line[0] === '7')

    test('deve ter exatamente 113 registros tipo 7 no arquivo', () => {
      expect(detailLines.length).toBe(113)
    })

    test('deve extrair tipo de registro "7" (detalhe) do primeiro registro', () => {
      const firstDetail = extractLineFields(detailLines[0], detail)
      expect(firstDetail.tipo_registro.raw).toBe('7')
    })

    test('deve extrair agência do cedente de todos os registros', () => {
      detailLines.forEach((line) => {
        const parsed = extractLineFields(line, detail)
        expect(parsed.agencia.raw).toBe('4321')
      })
    })

    test('deve extrair conta do cedente de todos os registros', () => {
      detailLines.forEach((line) => {
        const parsed = extractLineFields(line, detail)
        expect(parsed.conta.raw).toBe('00012345')
      })
    })

    test('deve extrair convênio de todos os registros', () => {
      detailLines.forEach((line) => {
        const parsed = extractLineFields(line, detail)
        expect(parsed.convenio.raw).toBeTruthy()
        expect(parsed.convenio.raw).toBe('9007654')
      })
    })

    test('deve extrair nosso número de todos os registros', () => {
      detailLines.forEach((line) => {
        const parsed = extractLineFields(line, detail)
        expect(parsed.nosso_numero.raw).toBeTruthy()
        expect(parsed.nosso_numero.raw.length).toBe(17)
      })
    })

    test('deve extrair valor do título maior que zero de todos os registros', () => {
      detailLines.forEach((line) => {
        const parsed = extractLineFields(line, detail)
        expect(parsed.valor_titulo.value).toBeGreaterThan(0)
      })
    })

    test('deve extrair vencimento válido de todos os registros', () => {
      detailLines.forEach((line) => {
        const parsed = extractLineFields(line, detail)
        expect(parsed.vencimento.raw).toBeTruthy()
        expect(parsed.vencimento.raw.length).toBe(6)
      })
    })

    test('deve extrair nome do sacado de todos os registros', () => {
      detailLines.forEach((line) => {
        const parsed = extractLineFields(line, detail)
        expect(parsed.nome.value).toBeTruthy()
        expect(String(parsed.nome.value).trim().length).toBeGreaterThan(0)
      })
    })

    test('deve extrair documento do sacado válido de todos os registros', () => {
      detailLines.forEach((line) => {
        const parsed = extractLineFields(line, detail)
        expect(parsed.sacado_numero_inscricao.raw).toBeTruthy()
        expect(parsed.sacado_numero_inscricao.raw.length).toBe(14)
      })
    })

    test('primeiro registro deve ter dados específicos do COMERCIAL ALFA LTDA', () => {
      const firstDetail = extractLineFields(detailLines[0], detail)

      expect(String(firstDetail.nome.value).trim()).toBe('COMERCIAL ALFA LTDA')
      expect(firstDetail.sacado_numero_inscricao.raw).toBe('01000000997396')
      expect(firstDetail.valor_titulo.value).toBe(3390.2)
      expect(firstDetail.nosso_numero.raw).toBe('90076541000044534')
    })
  })

  describe('Particularidades do BB', () => {
    test('tipo de registro deve ser "7" (não "1" como padrão FEBRABAN)', () => {
      expect(detail.tipo_registro.pattern).toBe('7')
    })

    test('nome do sacado deve ter apenas 37 caracteres (não 40 como padrão)', () => {
      expect(detail.nome.size).toBe(37)
    })

    test('deve ter campo brancos_2 nas posições 272-274 (complemento do nome)', () => {
      expect(detail.brancos_2).toBeDefined()
      expect(detail.brancos_2.pos).toEqual([272, 274])
      expect(detail.brancos_2.size).toBe(3)
    })

    test('nosso número deve ter 17 posições (mais longo que outros bancos)', () => {
      expect(detail.nosso_numero.size).toBe(17)
    })
  })
})
