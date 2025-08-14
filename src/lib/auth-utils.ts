/**
 * Utilitários para gerenciamento de autenticação e sessão
 */

/**
 * Lista de cookies do NextAuth que devem ser limpos
 */
const NEXTAUTH_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.pkce.code_verifier',
  '__Secure-next-auth.pkce.code_verifier'
]

/**
 * Limpa todos os cookies relacionados ao NextAuth
 * Útil quando há problemas com tokens corrompidos
 */
export function clearAuthCookies(): void {
  if (typeof window === 'undefined') {
    console.warn('clearAuthCookies só pode ser executado no cliente')
    return
  }

  NEXTAUTH_COOKIES.forEach(cookieName => {
    // Remove cookie do domínio atual
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    
    // Remove cookie com domínio específico (se houver)
    const domain = window.location.hostname
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`
    
    // Remove cookie com subdomínio (se houver)
    if (domain.includes('.')) {
      const rootDomain = domain.split('.').slice(-2).join('.')
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain};`
    }
  })

  console.log('Cookies de autenticação limpos')
}

/**
 * Limpa dados de sessão do localStorage e sessionStorage
 */
export function clearSessionStorage(): void {
  if (typeof window === 'undefined') {
    console.warn('clearSessionStorage só pode ser executado no cliente')
    return
  }

  // Limpa itens relacionados ao NextAuth
  const keysToRemove = [
    'nextauth.message',
    'nextauth.state',
    'nextauth.pkce.code_verifier',
    'nextauth.csrf_token'
  ]

  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })

  console.log('Dados de sessão limpos')
}

/**
 * Executa limpeza completa de autenticação e redireciona para login
 */
export function forceLogout(redirectUrl: string = '/login'): void {
  if (typeof window === 'undefined') {
    console.warn('forceLogout só pode ser executado no cliente')
    return
  }

  try {
    // Limpa cookies e storage
    clearAuthCookies()
    clearSessionStorage()

    // Aguarda um pouco para garantir que a limpeza foi processada
    setTimeout(() => {
      window.location.href = redirectUrl
    }, 100)
  } catch (error) {
    console.error('Erro durante logout forçado:', error)
    // Fallback: redireciona mesmo com erro
    window.location.href = redirectUrl
  }
}

/**
 * Verifica se há indícios de token corrompido baseado no erro
 */
export function isJWTError(error: unknown): boolean {
  if (!error) return false

  const errorString = error.toString().toLowerCase()
  const jwtErrorIndicators = [
    'jwt',
    'decryption',
    'jwedecryptionfailed',
    'session_error',
    'invalid token',
    'malformed token'
  ]

  return jwtErrorIndicators.some(indicator => errorString.includes(indicator))
}

/**
 * Hook para detectar e tratar erros de autenticação
 */
export function handleAuthError(error: unknown): void {
  console.error('Erro de autenticação detectado:', error)

  if (isJWTError(error)) {
    console.log('Erro JWT detectado, executando limpeza de sessão...')
    forceLogout('/auth/error?error=JWTSessionError')
  }
}