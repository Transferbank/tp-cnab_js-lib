export class Cnab400LineTypeChecker {
  static isHeader(rawLine: string): boolean {
    return rawLine.startsWith('0')
  }

  static isDetalhe(rawLine: string, recordType: string = '1'): boolean {
    return rawLine.startsWith(recordType)
  }

  static isTrailer(rawLine: string): boolean {
    return rawLine.startsWith('9')
  }

  static isRegistro(rawLine: string, recordType: string, serviceType?: string): boolean {
    return rawLine.startsWith(recordType) && (serviceType == null || rawLine.substring(1, 3) === serviceType)
  }
}

export class Cnab240LineTypeChecker {
  private static hasMinLength(rawLine: string, minLength: number): boolean {
    return rawLine.length >= minLength
  }

  static isHeaderArquivo(rawLine: string): boolean {
    return this.hasMinLength(rawLine, 8) && rawLine[7] === '0'
  }

  static isHeaderLote(rawLine: string): boolean {
    return this.hasMinLength(rawLine, 8) && rawLine[7] === '1'
  }

  static isDetalhe(rawLine: string): boolean {
    return this.hasMinLength(rawLine, 8) && rawLine[7] === '3'
  }

  static isTrailerLote(rawLine: string): boolean {
    return this.hasMinLength(rawLine, 8) && rawLine[7] === '5'
  }

  static isTrailerArquivo(rawLine: string): boolean {
    return this.hasMinLength(rawLine, 8) && rawLine[7] === '9'
  }

  static isSegmentoP(rawLine: string): boolean {
    return this.hasMinLength(rawLine, 14) && rawLine[7] === '3' && rawLine[13] === 'P'
  }

  static isSegmentoQ(rawLine: string): boolean {
    return this.hasMinLength(rawLine, 14) && rawLine[7] === '3' && rawLine[13] === 'Q'
  }

  static isSegmentoR(rawLine: string): boolean {
    return this.hasMinLength(rawLine, 14) && rawLine[7] === '3' && rawLine[13] === 'R'
  }

  static isSegmentoS(rawLine: string, printType?: string): boolean {
    const isSegmento = this.hasMinLength(rawLine, 14) && rawLine[7] === '3' && rawLine[13] === 'S'
    return isSegmento && (printType == null || rawLine[17] === printType)
  }

  static isSegmentoY(rawLine: string, optionalRecordCode?: string): boolean {
    const isSegmento = this.hasMinLength(rawLine, 14) && rawLine[7] === '3' && rawLine[13] === 'Y'
    return isSegmento && (optionalRecordCode == null || rawLine.substring(17, 19) === optionalRecordCode)
  }
}
