import { render, screen } from '@testing-library/react'
import Navigation from '../Navigation'

describe('Navigation Component', () => {
  it('should render navigation component', () => {
    const { container } = render(<Navigation />)
    
    // Verificar que el componente se renderiza
    expect(container).toBeTruthy()
    expect(container.querySelector('nav')).toBeTruthy()
  })

  it('should render navigation links', () => {
    render(<Navigation />)
    
    // Verificar que hay links en la navegación
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should have proper navigation structure', () => {
    const { container } = render(<Navigation />)
    
    // Verificar estructura básica
    const nav = container.querySelector('nav')
    expect(nav).toBeTruthy()
    expect(nav?.className).toContain('bg-white')
  })
})
