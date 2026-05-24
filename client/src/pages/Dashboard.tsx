import { useSocket } from '@/hooks/useSocket.js'
import { FeedPage } from '@/features/feed/FeedPage.js'

const Dashboard = () => {
  useSocket()
  return <FeedPage />
}

export default Dashboard
