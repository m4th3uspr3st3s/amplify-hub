import { redirect } from 'next/navigation'

// `hub.amplifyhealth.com.br` é area de membros, nao landing — o site
// institucional (amplifyhealth.com.br) cumpre esse papel. A raiz aqui
// despacha imediatamente para o lobby; o proxy.ts faz o gating de auth
// (usuario sem sessao cai em /login).
export default function HomePage() {
  redirect('/dashboard')
}
