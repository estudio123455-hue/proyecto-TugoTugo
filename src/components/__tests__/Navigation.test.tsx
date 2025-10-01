import { render, screen } from '@testing-library/react'
import Navigation from '../Navigation'

// Mock de next-auth para simular diferentes estados de sesión
jest.mock('next-auth/react')

describe('Navigation Component', () => {
  it('should render Home link', () => {
    render(<Navigation />)
    
    const homeLink = screen.getByText('Home')
    expect(homeLink).toBeTruthy()
  })

  it('should render How it Works link', () => {
    render(<Navigation />)
    
    const howItWorksLink = screen.getByText('How it Works')
    expect(howItWorksLink).toBeTruthy()
  })

  it('should render navigation component', () => {
    const { container } = render(<Navigation />)
    
    // Verificar que el componente se renderiza
    expect(container).toBeTruthy()
  })
})
