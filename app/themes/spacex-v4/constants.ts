import { parseRgba } from './utils/color'

export const COLOR_PAST_PRESENT_STR = 'rgba(255, 255, 255, 1)'
export const COLOR_FUTURE_STR = 'rgba(255, 255, 255, 0.3)'
export const COLOR_INNER_ARC_STR = 'rgba(0, 0, 0, 0.6)'
export const COLOR_INNER_DOT_START_STR = 'rgba(255, 255, 255, 0)'

export const COLOR_PAST_PRESENT: RgbaColor = parseRgba(COLOR_PAST_PRESENT_STR)!
export const COLOR_FUTURE: RgbaColor = parseRgba(COLOR_FUTURE_STR)!
export const COLOR_INNER_DOT_START: RgbaColor = parseRgba(COLOR_INNER_DOT_START_STR)!
