import * as path from 'path'


export function resPath(): string {
  return path.join(process.cwd(), 'res')
}
