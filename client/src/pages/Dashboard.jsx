import LogoutButton from "../components/auth/LogoutButton";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {user?.email}</p>
      <LogoutButton />
    </div>
  );
};

export default Dashboard;
