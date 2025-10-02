/**
 * Pruebas de integración para formularios de login
 * Verifica que el formulario funcione correctamente con validación
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Componente de ejemplo de formulario de login
function LoginForm({ onSubmit }: { onSubmit: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: string[] = []

    if (!email) newErrors.push('Email es requerido')
    if (!password) newErrors.push('Contraseña es requerida')
    if (password.length < 6) newErrors.push('Contraseña muy corta')

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors([])
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="email-input"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
      />
      <button type="submit">Iniciar Sesión</button>
      {errors.length > 0 && (
        <div data-testid="error-messages">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
    </form>
  )
}

import { useState } from 'react'

describe('LoginForm Integration Tests', () => {
  it('should render form with all fields', () => {
    const mockSubmit = jest.fn()
    render(<LoginForm onSubmit={mockSubmit} />)

    expect(screen.getByTestId('email-input')).toBeTruthy()
    expect(screen.getByTestId('password-input')).toBeTruthy()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeTruthy()
  })

  it('should show validation errors when submitting empty form', async () => {
    const mockSubmit = jest.fn()
    render(<LoginForm onSubmit={mockSubmit} />)

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('error-messages')).toBeInTheDocument()
    })

    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('should validate password length', async () => {
    const mockSubmit = jest.fn()
    render(<LoginForm onSubmit={mockSubmit} />)

    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, '123')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/contraseña muy corta/i)).toBeTruthy()
    })

    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn()
    render(<LoginForm onSubmit={mockSubmit} />)

    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should clear errors after successful submission', async () => {
    const mockSubmit = jest.fn()
    render(<LoginForm onSubmit={mockSubmit} />)

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    // Primer submit sin datos (genera errores)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-messages')).toBeTruthy()
    })

    // Llenar formulario correctamente
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByTestId('error-messages')).toBeNull()
    })
  })
})
