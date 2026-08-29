export type LabelFormat = {
  countX: number
  countY: number
  width: number
  height: number
  horizontalPitch: number
  verticalPitch: number
  leftMargin: number
  topMargin: number
  fontSize: number
  imageSize: number
}

export const TwentyFourPerSheet: LabelFormat = {
  // https://www.labelplanet.co.uk/label-templates-for-rounded-rectangle-labels/label-templates-24-per-sheet-lp24-63/
  countX: 3,
  countY: 8,
  width: 63.5,
  height: 33.9,
  horizontalPitch: 66,
  verticalPitch: 33.9,
  leftMargin: 7.25,
  topMargin: 12.9,
  fontSize: 10,
  imageSize: 8,
}

export const EightPerSheet: LabelFormat = {
  // https://www.labelplanet.co.uk/label-templates-for-rounded-rectangle-labels/label-templates-8-per-sheet-lp8-99/
  countX: 2,
  countY: 4,
  width: 99.1,
  height: 67.7,
  horizontalPitch: 101.6,
  verticalPitch: 67.7,
  leftMargin: 4.65,
  topMargin: 13.1,
  fontSize: 16,
  imageSize: 12,
}

export const SixtyFivePerSheet: LabelFormat = {
  // https://www.labelplanet.co.uk/label-templates-for-rounded-rectangle-labels/label-templates-65-per-sheet-lp65-38/
  countX: 5,
  countY: 13,
  width: 38.1,
  height: 21.2,
  horizontalPitch: 40.6,
  verticalPitch: 21.2,
  leftMargin: 4.75,
  topMargin: 10.7,
  fontSize: 8,
  imageSize: 10,
}

export const FourteenPerSheet: LabelFormat = {
  // https://www.labelplanet.co.uk/label-templates-for-rounded-rectangle-labels/label-templates-14-per-sheet-lp14-99/
  countX: 2,
  countY: 7,
  width: 99.1,
  height: 38.1,
  horizontalPitch: 101.6,
  verticalPitch: 38.1,
  leftMargin: 4.65,
  topMargin: 15.15,
  fontSize: 10,
  imageSize: 8,
}

export const EighteenPerSheet: LabelFormat = {
  // https://www.labelplanet.co.uk/label-templates-for-rounded-rectangle-labels/label-templates-18-per-sheet-lp18-63/
  countX: 3,
  countY: 6,
  width: 63.5,
  height: 46.6,
  horizontalPitch: 66,
  verticalPitch: 46.6,
  leftMargin: 7.25,
  topMargin: 8.7,
  fontSize: 10,
  imageSize: 8,
}

export const TwentyOnePerSheet: LabelFormat = {
  // https://www.labelplanet.co.uk/label-templates-for-rounded-rectangle-labels/label-templates-21-per-sheet-lp21-63/
  countX: 3,
  countY: 7,
  width: 63.5,
  height: 38.1,
  horizontalPitch: 66,
  verticalPitch: 38.1,
  leftMargin: 7.25,
  topMargin: 15.15,
  fontSize: 10,
  imageSize: 8,
}

export const LABEL_FORMATS: Record<string, LabelFormat> = {
  '8': EightPerSheet,
  '14': FourteenPerSheet,
  '18': EighteenPerSheet,
  '21': TwentyOnePerSheet,
  '24': TwentyFourPerSheet,
  '65': SixtyFivePerSheet,
}

export const LABELS_PER_SHEET_OPTIONS = [
  { value: '8', label: '8 labels' },
  { value: '14', label: '14 labels' },
  { value: '18', label: '18 labels' },
  { value: '21', label: '21 labels' },
  { value: '24', label: '24 labels' },
  { value: '65', label: '65 labels' },
] as const
