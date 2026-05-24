import { BookOpen } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button.js'

const Home = () => (
  <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
    <BookOpen className="text-primary h-12 w-12" />
    <h1 className="text-4xl font-bold">Studium</h1>
    <p className="text-muted-foreground max-w-md">
      Your college community platform. Connect, learn, and grow with peers.
    </p>
    <div className="flex gap-4">
      <Button asChild>
        <Link to="/login">Get Started</Link>
      </Button>
    </div>
  </div>
)

export default Home
