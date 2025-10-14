import { useEffect, useRef } from 'react'

interface ScrollLockOptions {
  isLocked: boolean
}

export const useScrollLock = ({ isLocked }: ScrollLockOptions) => {
  const scrollPosition = useRef<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isLocked) {
      // Guardar posición actual del scroll
      scrollPosition.current = window.pageYOffset

      // Aplicar estilos para bloquear scroll (especialmente para iOS)
      const body = document.body
      const html = document.documentElement

      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.top = `-${scrollPosition.current}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'

      // Prevenir scroll en iOS Safari
      html.style.overflow = 'hidden'
      
      // Añadir clase para CSS específicos
      body.classList.add('scroll-locked')
    } else {
      // Restaurar scroll
      const body = document.body
      const html = document.documentElement

      body.style.overflow = ''
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''

      html.style.overflow = ''
      
      body.classList.remove('scroll-locked')

      // Restaurar posición del scroll
      window.scrollTo(0, scrollPosition.current)
    }

    // Cleanup function
    return () => {
      const body = document.body
      const html = document.documentElement

      body.style.overflow = ''
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''

      html.style.overflow = ''
      
      body.classList.remove('scroll-locked')
    }
  }, [isLocked])

  return null
}
