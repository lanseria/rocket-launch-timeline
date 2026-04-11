import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn-action', 'rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:opacity-70'],
  ],
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      themeKey: 'font',
      fonts: {
        sans: ['Saira', 'Noto Sans SC'],
        saira: [
          {
            name: 'Saira',
            weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
          },
        ],
        noto: [
          {
            name: 'Noto Sans SC',
            weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
          },
        ],
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
