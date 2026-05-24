import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/utils.js'
import LoginPage from '../Login.js'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockLogin    = vi.fn()
const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    login:    mockLogin,
    register: mockRegister,
    user:     null,
    loading:  false,
  }),
}))

vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Login form ──────────────────────────────────────────────────────────────

  describe('Login form (default view)', () => {
    it('renders the login form by default', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText(/Email or Roll Number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
    })

    it('shows a Sign Up link to toggle modes', () => {
      render(<LoginPage />)
      expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument()
    })

    it('calls login and navigates on valid submission', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)
      render(<LoginPage />)

      await user.type(screen.getByLabelText(/Email or Roll Number/i), 'test@geu.ac.in')
      await user.type(screen.getByLabelText(/Password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Sign In/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@geu.ac.in', 'password123')
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('shows a server error message on login failure', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue({ response: { data: { error: { message: 'Invalid email or password' } } } })
      render(<LoginPage />)

      await user.type(screen.getByLabelText(/Email or Roll Number/i), 'bad@geu.ac.in')
      await user.type(screen.getByLabelText(/Password/i), 'wrongpass')
      await user.click(screen.getByRole('button', { name: /Sign In/i }))

      await waitFor(() => {
        expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
      })
    })
  })

  // ── Registration form ───────────────────────────────────────────────────────

  describe('Registration form (signup mode)', () => {
    const switchToSignup = async (user: ReturnType<typeof userEvent.setup>) => {
      render(<LoginPage />)
      await user.click(screen.getByRole('button', { name: /Sign Up/i }))
    }

    it('shows step 1 fields after clicking Sign Up', async () => {
      const user = userEvent.setup()
      await switchToSignup(user)

      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/College Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Roll Number/i)).toBeInTheDocument()
    })

    it('shows validation error when name is too short on step 1', async () => {
      const user = userEvent.setup()
      await switchToSignup(user)

      await user.type(screen.getByLabelText(/Full Name/i), 'A')
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/At least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for invalid email on step 1', async () => {
      const user = userEvent.setup()
      await switchToSignup(user)

      await user.type(screen.getByLabelText(/Full Name/i), 'Valid Name')
      await user.type(screen.getByLabelText(/College Email/i), 'not-an-email')
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/Invalid email/i)).toBeInTheDocument()
      })
    })

    it('shows password mismatch error', async () => {
      const user = userEvent.setup()
      await switchToSignup(user)

      await user.type(screen.getByLabelText(/Full Name/i), 'Rajat Kumar')
      await user.type(screen.getByLabelText(/College Email/i), 'rajat@geu.ac.in')
      await user.type(screen.getByLabelText(/Roll Number/i), 'GEU21CS001')
      // Get password fields by placeholder
      const pwInputs = [
        screen.getByPlaceholderText(/At least 8 characters/i),
        screen.getByPlaceholderText(/Repeat password/i),
      ]
      await user.type(pwInputs[0]!, 'password123')
      await user.type(pwInputs[1]!, 'different456')
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('advances to step 2 with valid step 1 data', async () => {
      const user = userEvent.setup()
      await switchToSignup(user)

      await user.type(screen.getByLabelText(/Full Name/i), 'Rajat Kumar')
      await user.type(screen.getByLabelText(/College Email/i), 'rajat@geu.ac.in')
      await user.type(screen.getByLabelText(/Roll Number/i), 'GEU21CS001')
      const pwInputs = [
        screen.getByPlaceholderText(/At least 8 characters/i),
        screen.getByPlaceholderText(/Repeat password/i),
      ]
      await user.type(pwInputs[0]!, 'password123')
      await user.type(pwInputs[1]!, 'password123')
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument()
      })
    })

    it('step 2 shows college dropdown (not a text input)', async () => {
      const user = userEvent.setup()
      await switchToSignup(user)

      // Get to step 2
      await user.type(screen.getByLabelText(/Full Name/i), 'Rajat Kumar')
      await user.type(screen.getByLabelText(/College Email/i), 'rajat@geu.ac.in')
      await user.type(screen.getByLabelText(/Roll Number/i), 'GEU21CS001')
      const pwInputs = [
        screen.getByPlaceholderText(/At least 8 characters/i),
        screen.getByPlaceholderText(/Repeat password/i),
      ]
      await user.type(pwInputs[0]!, 'password123')
      await user.type(pwInputs[1]!, 'password123')
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        const collegeSelect = screen.getByLabelText(/College \/ University/i)
        expect(collegeSelect.tagName.toLowerCase()).toBe('select')
      })
    })

    it('step 2 has GEU as a college option', async () => {
      const user = userEvent.setup()
      await switchToSignup(user)

      await user.type(screen.getByLabelText(/Full Name/i), 'Rajat Kumar')
      await user.type(screen.getByLabelText(/College Email/i), 'rajat@geu.ac.in')
      await user.type(screen.getByLabelText(/Roll Number/i), 'GEU21CS001')
      const pwInputs = [
        screen.getByPlaceholderText(/At least 8 characters/i),
        screen.getByPlaceholderText(/Repeat password/i),
      ]
      await user.type(pwInputs[0]!, 'password123')
      await user.type(pwInputs[1]!, 'password123')
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Graphic Era University/i })).toBeInTheDocument()
      })
    })
  })
})
