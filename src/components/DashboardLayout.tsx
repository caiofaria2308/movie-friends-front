import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, CreditCard, Users, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                {/* User Section */}
                <div className={styles.userSection}>
                    <button
                        className={styles.userButton}
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                        <div className={styles.userAvatar}>
                            <User size={20} />
                        </div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{user?.name || 'User'}</span>
                            <span className={styles.userRole}>{user?.role || 'user'}</span>
                        </div>
                        <ChevronDown size={18} className={userMenuOpen ? styles.chevronOpen : ''} />
                    </button>

                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                        <div className={styles.userMenu}>
                            <NavLink
                                to="/dashboard/pix"
                                className={styles.userMenuItem}
                                onClick={() => setUserMenuOpen(false)}
                            >
                                <CreditCard size={16} />
                                <span>Chaves Pix</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                    >
                        <Users size={20} />
                        <span>Familias</span>
                    </NavLink>
                    <NavLink
                        to="/dashboard/calendar"
                        className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                    >
                        <Calendar size={20} />
                        <span>Calendário</span>
                    </NavLink>
                </nav>

                {/* Logout Button */}
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
