import { useAuth } from '@/hooks/useAuth.js'
import { Button } from '@/components/ui/button.js'
import { LogOut } from 'lucide-react'

const LogoutButton = () => {
  const { logout } = useAuth()

  return (
    <Button variant="ghost" size="sm" onClick={() => void logout()}>
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  )
}

export default LogoutButton
