import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import {
  BookOpen, Mail, Lock, User, Hash, AlertCircle, Eye, EyeOff,
  School, Calendar, Github, Linkedin, Globe,
} from 'lucide-react'
import type { AxiosError } from 'axios'
import { useAuth } from '@/hooks/useAuth.js'
import { loginSchema } from '@/lib/validators/auth.js'
import type { LoginInput } from '@/lib/validators/auth.js'

// ─── Extended register schema (3-step) ────────────────────────────────────

const registerSchema = z.object({
  // Step 1
  name: z.string().min(2, 'At least 2 characters').max(50),
  email: z.string().min(1, 'Required').email('Invalid email'),
  rollNumber: z.string().min(1, 'Required'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string().min(1, 'Required'),
  // Step 2
  college: z.string().optional(),
  branch: z.string().optional(),
  year: z.string().optional(),
  skills: z.string().optional(),
  // Step 3
  bio: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterInput = z.infer<typeof registerSchema>

const getServerMessage = (err: unknown): string | null => {
  const e = err as AxiosError<{ error?: { message?: string } }>
  return e?.response?.data?.error?.message ?? null
}

// ─── Dehradun colleges list ────────────────────────────────────────────────

const COLLEGES = [
  'Graphic Era University (GEU)',
  'UPES (University of Petroleum and Energy Studies)',
  'DIT University',
  'Uttaranchal University',
  'Doon University',
  'Graphic Era Hill University (GEHU)',
  'Dev Bhoomi Uttarakhand University (DBUU)',
  'Shri Guru Ram Rai University (SGRRU)',
  'IMS Unison University',
  'Quantum University',
  'Himalayan Institute of Technology',
  'Women\'s Institute of Technology, Dehradun',
  'College of Technology, GBPUA&T',
  'IIT Roorkee',
  'NIT Uttarakhand',
  'Delhi University',
  'Jawaharlal Nehru University (JNU)',
  'IIT Delhi',
  'IIT Bombay',
  'Anna University',
  'Other',
]

const BRANCHES = [
  // B.Tech
  'B.Tech Computer Science Engineering (CSE)',
  'B.Tech Computer Science & IT',
  'B.Tech Information Technology (IT)',
  'B.Tech Electronics & Communication Engineering (ECE)',
  'B.Tech Mechanical Engineering (ME)',
  'B.Tech Civil Engineering (CE)',
  'B.Tech Electrical Engineering (EE)',
  'B.Tech Chemical Engineering',
  'B.Tech Petroleum Engineering',
  'B.Tech Biotechnology',
  'B.Tech Aerospace Engineering',
  // BCA/MCA
  'BCA (Bachelor of Computer Applications)',
  'MCA (Master of Computer Applications)',
  // MBA/BBA
  'MBA (Master of Business Administration)',
  'BBA (Bachelor of Business Administration)',
  // B.Sc
  'B.Sc Computer Science',
  'B.Sc Physics',
  'B.Sc Mathematics',
  'B.Sc Chemistry',
  'B.Sc Biotechnology',
  // M.Tech
  'M.Tech CSE',
  'M.Tech ECE',
  'M.Tech Mechanical',
  // Others
  'B.Pharma',
  'M.Pharma',
  'LLB / B.A. LLB',
  'B.Arch',
  'Ph.D',
  'Other',
]

// ─── Shared field component ────────────────────────────────────────────────

const Field = ({
  Icon, label, id, error, rightSlot, ...props
}: { Icon: React.ElementType; label: string; id: string; error?: string; rightSlot?: React.ReactNode } & React.ComponentProps<'input'>) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        id={id}
        className={`w-full pl-10 ${rightSlot ? 'pr-10' : 'pr-4'} py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm ${error ? 'border-red-400' : ''}`}
        {...props}
      />
      {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
    </div>
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <AlertCircle className="h-3 w-3 shrink-0" />{error}
      </p>
    )}
  </div>
)

const SelectField = ({
  Icon, label, id, error, options, placeholder, ...props
}: { Icon: React.ElementType; label: string; id: string; error?: string; options: string[]; placeholder?: string } & React.ComponentProps<'select'>) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
      <select
        id={id}
        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm appearance-none ${error ? 'border-red-400' : ''}`}
        {...props}
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <AlertCircle className="h-3 w-3 shrink-0" />{error}
      </p>
    )}
  </div>
)

const TextareaField = ({ label, id, error, ...props }: { label: string; id: string; error?: string } & React.ComponentProps<'textarea'>) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <textarea
      id={id}
      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm resize-none ${error ? 'border-red-400' : ''}`}
      {...props}
    />
    {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
  </div>
)

// ─── Auth form ─────────────────────────────────────────────────────────────

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [step, setStep] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const regForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '', email: '', rollNumber: '', password: '', confirmPassword: '',
      college: '', branch: '', year: '', skills: '',
      bio: '', github: '', linkedin: '', portfolio: '',
    },
  })

  const handleLogin = loginForm.handleSubmit(async (v) => {
    setServerError(null)
    try {
      await login(v.email, v.password)
      void navigate('/dashboard')
    } catch (err) {
      setServerError(getServerMessage(err) ?? 'Invalid email or password.')
    }
  })

  const goNext = async () => {
    const fields: Record<number, (keyof RegisterInput)[]> = {
      1: ['name', 'email', 'rollNumber', 'password', 'confirmPassword'],
      2: [],
    }
    const valid = await regForm.trigger(fields[step] ?? [])
    if (valid) setStep((s) => s + 1)
  }

  const handleRegister = regForm.handleSubmit(async (v) => {
    setServerError(null)
    try {
      const skillsArr = v.skills ? v.skills.split(',').map((s) => s.trim()).filter(Boolean) : []
      const links: Record<string, string> = {}
      if (v.github) links.github = v.github
      if (v.linkedin) links.linkedin = v.linkedin
      if (v.portfolio) links.portfolio = v.portfolio

      await register({
        name: v.name,
        email: v.email,
        password: v.password,
        rollNumber: v.rollNumber,
        college: v.college || undefined,
        branch: v.branch || undefined,
        year: v.year ? parseInt(v.year) : undefined,
        bio: v.bio || undefined,
        skills: skillsArr,
        links: Object.keys(links).length ? links : undefined,
      } as any)
      void navigate('/dashboard')
    } catch (err) {
      setServerError(getServerMessage(err) ?? 'Registration failed. Please try again.')
    }
  })

  const switchMode = () => {
    setIsSignUp((v) => !v)
    setStep(1)
    setServerError(null)
    loginForm.reset()
    regForm.reset()
  }

  const e = regForm.formState.errors
  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} tabIndex={-1} className="text-gray-400 hover:text-gray-600 p-1">
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 w-full max-w-md mx-auto transition-colors">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="lg:hidden flex items-center justify-center mb-4">
          <div className="bg-primary p-2.5 rounded-xl"><BookOpen className="h-7 w-7 text-white" /></div>
          <h1 className="text-2xl font-bold text-primary ml-3">Studium</h1>
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
          {isSignUp ? 'Join Your College Community' : 'Welcome back'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isSignUp
            ? `Step ${step} of 3: ${step === 1 ? 'Basic Information' : step === 2 ? 'Academic Details' : 'Profile Setup'}`
            : 'Sign in to your account'}
        </p>
      </div>

      {/* Progress bar */}
      {isSignUp && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1,2,3].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${s <= step ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {s}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Login form */}
      {!isSignUp && (
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <Field Icon={Mail} label="Email or Roll Number" id="email" type="email" placeholder="your.name@college.edu"
            error={loginForm.formState.errors.email?.message} {...loginForm.register('email')} />
          <Field Icon={Lock} label="Password" id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
            error={loginForm.formState.errors.password?.message}
            rightSlot={<EyeBtn show={showPassword} toggle={() => setShowPassword((v) => !v)} />}
            {...loginForm.register('password')} />
          {serverError && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="h-4 w-4" />{serverError}</p>}
          <button type="submit" disabled={loginForm.formState.isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-60 transition">
            {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      )}

      {/* Register form */}
      {isSignUp && (
        <div className="space-y-4">
          {step === 1 && (
            <>
              <Field Icon={User} label="Full Name" id="name" type="text" placeholder="Enter your full name"
                error={e.name?.message} {...regForm.register('name')} />
              <Field Icon={Mail} label="College Email" id="email" type="email" placeholder="your.name@college.edu"
                error={e.email?.message} {...regForm.register('email')} />
              <Field Icon={Hash} label="Roll Number / Student ID" id="rollNumber" type="text" placeholder="2021CS001"
                error={e.rollNumber?.message} {...regForm.register('rollNumber')} />
              <Field Icon={Lock} label="Password" id="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters"
                error={e.password?.message}
                rightSlot={<EyeBtn show={showPassword} toggle={() => setShowPassword((v) => !v)} />}
                {...regForm.register('password')} />
              <Field Icon={Lock} label="Confirm Password" id="confirmPassword" type="password" placeholder="Repeat password"
                error={e.confirmPassword?.message} {...regForm.register('confirmPassword')} />
            </>
          )}

          {step === 2 && (
            <>
              <SelectField Icon={School} label="College / University" id="college"
                options={COLLEGES} placeholder="Select your college"
                {...regForm.register('college')} />
              <SelectField Icon={BookOpen} label="Branch / Department" id="branch"
                options={BRANCHES} placeholder="Select your branch"
                {...regForm.register('branch')} />
              <div className="space-y-1.5">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year of Study</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <select id="year" {...regForm.register('year')}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm">
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                    <option value="6">Graduate Student</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills <span className="text-gray-400 text-xs">(comma-separated)</span></label>
                <input id="skills" type="text" placeholder="Python, React, Machine Learning"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                  {...regForm.register('skills')} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <TextareaField label="Bio" id="bio" rows={3}
                placeholder="Tell us about yourself, your interests and goals…"
                {...regForm.register('bio')} />
              <Field Icon={Github} label="GitHub (optional)" id="github" type="url" placeholder="https://github.com/username"
                {...regForm.register('github')} />
              <Field Icon={Linkedin} label="LinkedIn (optional)" id="linkedin" type="url" placeholder="https://linkedin.com/in/username"
                {...regForm.register('linkedin')} />
              <Field Icon={Globe} label="Portfolio (optional)" id="portfolio" type="url" placeholder="https://yourportfolio.com"
                {...regForm.register('portfolio')} />
            </>
          )}

          {serverError && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="h-4 w-4" />{serverError}</p>}

          <div className="flex gap-3">
            {step > 1 && (
              <button type="button" onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => void goNext()}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition text-sm">
                Continue
              </button>
            ) : (
              <button type="button" onClick={() => void handleRegister()}
                disabled={regForm.formState.isSubmitting}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-60 transition text-sm">
                {regForm.formState.isSubmitting ? 'Creating account…' : 'Create Account'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button onClick={switchMode} className="text-primary hover:text-primary/80 font-medium ml-1 transition">
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

const LoginPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
    <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 items-center">
      {/* Hero */}
      <div className="hidden lg:block">
        <div className="flex items-center mb-6">
          <div className="bg-primary p-3 rounded-xl"><BookOpen className="h-8 w-8 text-white" /></div>
          <h1 className="text-3xl font-bold text-primary ml-3">Studium</h1>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Your College Community Platform</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          The perfect blend of Notion, Reddit, and LinkedIn for college students. Connect, learn, and grow together.
        </p>
        <div className="space-y-4">
          {[
            { icon: BookOpen, text: 'Collaborative knowledge sharing' },
            { icon: Mail,     text: 'Reddit-style community discussions' },
            { icon: User,     text: 'Professional networking & mentorship' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg mr-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <AuthForm />
    </div>
  </div>
)

export default LoginPage
