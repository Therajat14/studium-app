import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { BookOpen, Mail, Lock, User, Hash, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.js'
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/lib/validators/auth.js'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card.js'
import { Input } from '@/components/ui/input.js'
import { Button } from '@/components/ui/button.js'
import { Label } from '@/components/ui/label.js'
import { Separator } from '@/components/ui/separator.js'

// ─── Field wrapper with icon ───────────────────────────────────────────────

interface InputWithIconProps extends React.ComponentProps<'input'> {
  Icon: React.ElementType
  label: string
  error?: string
  id: string
}

const InputWithIcon = ({ Icon, label, error, id, ...props }: InputWithIconProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Icon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        id={id}
        aria-invalid={!!error}
        className="pl-9"
        {...props}
      />
    </div>
    {error && (
      <p className="text-destructive flex items-center gap-1 text-xs">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
)

// ─── Step progress indicator ───────────────────────────────────────────────

const ProgressBar = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-4">
    <p className="text-muted-foreground mb-2 text-sm font-medium">Step {currentStep} of 2</p>
    <div className="flex items-center justify-between">
      {[1, 2].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              step < currentStep
                ? 'bg-primary text-primary-foreground'
                : step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {step < currentStep ? <Check className="h-3.5 w-3.5" /> : step}
          </div>
          {step < 2 && (
            <div
              className={`h-1 flex-1 transition-colors ${
                step < currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
)

// ─── Auth form ─────────────────────────────────────────────────────────────

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [step, setStep] = useState(1) // step 1: name+rollNumber, step 2: email+password
  const [serverError, setServerError] = useState<string | null>(null)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  // ─── Login form ──────────────────────────────────────────────────────
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // ─── Register form ───────────────────────────────────────────────────
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', rollNumber: '', password: '', confirmPassword: '' },
  })

  const handleLoginSubmit = loginForm.handleSubmit(async (values) => {
    setServerError(null)
    try {
      await login(values.email, values.password)
      void navigate('/dashboard')
    } catch {
      setServerError('Invalid email or password. Please try again.')
    }
  })

  const handleRegisterStep = registerForm.handleSubmit(
    async (values) => {
      if (step === 1) {
        // Validate step 1 fields before advancing
        const step1Valid = await registerForm.trigger(['name', 'rollNumber'])
        if (step1Valid) setStep(2)
        return
      }

      // Step 2: submit
      setServerError(null)
      try {
        await register({
          name: values.name,
          email: values.email,
          password: values.password,
          rollNumber: values.rollNumber,
        })
        void navigate('/dashboard')
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message.includes('already exists')
            ? 'An account with this email already exists.'
            : 'Registration failed. Please try again.'
        setServerError(message)
      }
    },
    // On validation error at step 2, show errors
    () => {
      if (step === 1) void registerForm.trigger(['name', 'rollNumber'])
    },
  )

  const toggleMode = () => {
    setIsSignUp((prev) => !prev)
    setStep(1)
    setServerError(null)
    loginForm.reset()
    registerForm.reset()
  }

  const regErrors = registerForm.formState.errors

  return (
    <Card className="border-border bg-card w-full border shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isSignUp ? 'Join Your College Community' : 'Welcome Back'}
        </CardTitle>
        <CardDescription>
          {isSignUp ? (
            <>
              Complete your profile to get started.
              <ProgressBar currentStep={step} />
            </>
          ) : (
            'Sign in to your account to continue.'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* ─── Login form ─────────────────────────────────────────────── */}
        {!isSignUp && (
          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            <InputWithIcon
              Icon={Mail}
              label="College Email"
              id="email"
              type="email"
              placeholder="your.name@college.edu"
              autoComplete="email"
              error={loginForm.formState.errors.email?.message}
              {...loginForm.register('email')}
            />
            <InputWithIcon
              Icon={Lock}
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={loginForm.formState.errors.password?.message}
              {...loginForm.register('password')}
            />

            {serverError && (
              <p className="text-destructive flex items-center gap-1 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        )}

        {/* ─── Register form ───────────────────────────────────────────── */}
        {isSignUp && (
          <form onSubmit={handleRegisterStep} className="space-y-4" noValidate>
            {step === 1 && (
              <>
                <InputWithIcon
                  Icon={User}
                  label="Full Name"
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  error={regErrors.name?.message}
                  {...registerForm.register('name')}
                />
                <InputWithIcon
                  Icon={Hash}
                  label="Roll Number / Student ID"
                  id="rollNumber"
                  type="text"
                  placeholder="2021CS001"
                  error={regErrors.rollNumber?.message}
                  {...registerForm.register('rollNumber')}
                />
              </>
            )}

            {step === 2 && (
              <>
                <InputWithIcon
                  Icon={Mail}
                  label="College Email"
                  id="reg-email"
                  type="email"
                  placeholder="your.name@college.edu"
                  autoComplete="email"
                  error={regErrors.email?.message}
                  {...registerForm.register('email')}
                />
                <InputWithIcon
                  Icon={Lock}
                  label="Password"
                  id="reg-password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  error={regErrors.password?.message}
                  {...registerForm.register('password')}
                />
                <InputWithIcon
                  Icon={Lock}
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  error={regErrors.confirmPassword?.message}
                  {...registerForm.register('confirmPassword')}
                />
              </>
            )}

            {serverError && (
              <p className="text-destructive flex items-center gap-1 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {serverError}
              </p>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1"
                disabled={registerForm.formState.isSubmitting}
              >
                {registerForm.formState.isSubmitting
                  ? 'Creating account…'
                  : step < 2
                    ? 'Continue'
                    : 'Create Account'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <Separator className="my-2" />

      <CardFooter className="text-muted-foreground flex justify-center text-sm">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <Button variant="link" className="text-primary ml-1 p-0" onClick={toggleMode}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─── Page layout ───────────────────────────────────────────────────────────

const LoginPage = () => (
  <div className="bg-background flex min-h-screen items-center justify-center px-4 lg:px-8">
    <div className="border-border bg-card w-full max-w-5xl overflow-hidden rounded-xl border shadow-lg lg:grid lg:grid-cols-2">
      {/* Left hero panel */}
      <div className="bg-primary text-primary-foreground hidden flex-col justify-center space-y-6 p-10 lg:flex">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-7 w-7" />
          <h1 className="text-3xl font-bold">Studium</h1>
        </div>

        <h2 className="text-4xl leading-tight font-bold">Your College Community Platform</h2>

        <p className="text-base opacity-90">
          A hybrid of Notion, Reddit, and LinkedIn — designed for college students to connect,
          learn, and grow together.
        </p>

        <Separator className="bg-primary-foreground/40" />

        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Collaborative learning spaces
          </li>
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Smart community discussions
          </li>
          <li className="flex items-center gap-2">
            <User className="h-4 w-4" /> Career networking &amp; mentorship
          </li>
        </ul>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-8 lg:p-16">
        <AuthForm />
      </div>
    </div>
  </div>
)

export default LoginPage
