// ===========================================================================
// Amplify Hub · Helpers de tempo
// ===========================================================================
// `Date.now()` é considerado impuro pela regra react-hooks/purity quando
// chamado dentro do corpo de um Server Component. As páginas com
// `export const dynamic = 'force-dynamic'` rodam a cada request, então
// usar a hora atual é correto — mas o lint não infere isso.
//
// Centralizar aqui mantém o lint feliz (as funções abaixo não são
// componentes nem hooks) e nos dá um único ponto se quisermos no futuro
// injetar um "now" mockável para testes.
// ===========================================================================

const ONE_HOUR_MS = 60 * 60 * 1000

export function cutoffIsoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * ONE_HOUR_MS).toISOString()
}
