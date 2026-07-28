export interface LazyBillItem<T> {
  startLine: number
  resolve: () => Promise<T>
}
