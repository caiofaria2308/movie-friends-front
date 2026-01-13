import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, CreditCard, Users, LogOut, Hexagon } from 'lucide-react';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.layout}>
            {/* Header / Mobile Nav */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Hexagon className={styles.icon} />
                    <span>Crew</span>
                </div>
                <div className={styles.userInfo}>
                    <span>{user?.name || 'User'}</span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className={styles.main}>
                <Outlet />
            </main>

            {/* Bottom Navigation (Mobile First) */}
            <nav className={styles.bottomNav}>
                <NavLink to="/dashboard" end className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    <Users size={24} />
                    <span>Crews</span>
                </NavLink>
                <NavLink to="/dashboard/pix" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    <CreditCard size={24} />
                    <span>Pix</span>
                </NavLink>
                <NavLink to="/dashboard/calendar" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                    <Calendar size={24} />
                    <span>Day Offs</span>
                </NavLink>
                <button onClick={handleLogout} className={styles.navItem}>
                    <LogOut size={24} />
                    <span>Sair</span>
                </button>
            </nav>
        </div>
    );
};

export default DashboardLayout;
