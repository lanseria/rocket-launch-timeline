import spacexV4 from './spacex-v4'

export const themes = [spacexV4]
export const defaultThemeId = 'spacex-v4'

export function getTheme(id: string) {
  return themes.find(t => t.id === id)
}
