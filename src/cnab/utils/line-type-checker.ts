export class Cnab400LineTypeChecker {
  static isHeader(rawLine: string): boolean {
    return rawLine.startsWith('0')
  }
  static isDetalhe(rawLine: string): boolean {
    return rawLine.startsWith('1')
  }
  static isTrailer(rawLine: string): boolean {
    return rawLine.startsWith('9')
  }
  static isOptional(rawLine: string, optionalChar: string): boolean {
    return rawLine.startsWith(optionalChar)
  }
}
export class Cnab240LineTypeChecker {
  static isHeaderArquivo(rawLine: string): boolean {
    return rawLine[7] === '0'
  }
  static isHeaderLote(rawLine: string): boolean {
    return rawLine[7] === '1'
  }
  static isDetalhe(rawLine: string): boolean {
    return rawLine[7] === '3'
  }
  static isTrailerLote(rawLine: string): boolean {
    return rawLine[7] === '5'
  }
  static isTrailerArquivo(rawLine: string): boolean {
    return rawLine[7] === '9'
  }
  static isSegmentoP(rawLine: string): boolean {
    return rawLine[7] === '3' && rawLine[13] === 'P'
  }
  static isSegmentoQ(rawLine: string): boolean {
    return rawLine[7] === '3' && rawLine[13] === 'Q'
  }
  static isSegmentoR(rawLine: string): boolean {
    return rawLine[7] === '3' && rawLine[13] === 'R'
  }
  static isSegmentoS(rawLine: string): boolean {
    return rawLine[7] === '3' && rawLine[13] === 'S'
  }
}