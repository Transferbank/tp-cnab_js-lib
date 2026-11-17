export function writeAtRange(line: string[], range: [number, number], text: string): void {
  for (let index = 0; index < text.length; index++) {
    line[range[0] - 1 + index] = text[index]
  }
}
