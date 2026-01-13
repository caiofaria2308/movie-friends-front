import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register({ name, email, password, role: 'user' });
            navigate('/login');
        } catch (err) {
            setError('Erro ao criar conta. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Crew App</h1>
                <h2 className={styles.subtitle}>Criar Conta</h2>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Nome"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                    />
                    <Input
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                    />

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Cadastrar' : 'Cadastrar'}
                    </Button>
                </form>

                <p className={styles.footer}>
                    Já tem conta? <Link to="/login" className={styles.link}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
