export type DateFormat = 'long' | 'short'

export type LabelSpec = {
  date: Date | undefined
  objective: string
  images: string[]
  dateFormat: DateFormat
}
