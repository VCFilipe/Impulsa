


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoginCarousel from '../components/auth/LoginCarousel';
import { Building2, Mail, Lock } from 'lucide-react';
import { APP_NAME } from '../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Simulação de validação básica
    if (!email || !password) {
      setError('Email e senha são obrigatórios.');
      return;
    }
    // Em um app real, aqui ocorreria a chamada à API
    // Para simulação, qualquer entrada é válida
    login(email, password); // Context login only sets state and localStorage
    navigate('/home', { replace: true }); // Navigate after successful login
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Coluna do Formulário */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-8 sm:p-12 bg-white dark:bg-gray-800 shadow-2xl md:shadow-none z-10">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center mb-4 group"> {/* Changed mb-2 to mb-4 */}
            <img src="https://i.postimg.cc/MTL4TC0C/logo.png" alt={APP_NAME} className="h-36 mx-auto object-contain" /> {/* Increased h-24 to h-36 */}
          </Link>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">Acesse sua conta</h2>
          {/* Removed welcome subtitle */}

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className=""> {/* Removed space-y-5 */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="mt-2"> {/* Spacing between fields */}
              <label htmlFor="password" className="sr-only">Senha</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            {/* Removed "Esqueceu sua senha?" and "Lembrar-me" */}
            <Button type="submit" variant="primary" className="w-full !py-2.5 text-base mt-4"> {/* Spacing before button */}
              Entrar
            </Button>
          </form>
          {/* Removed "Não tem uma conta? Crie uma agora" */}
        </div>
      </div>

      {/* Coluna do Carrossel */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-primary to-blue-800 dark:from-gray-800 dark:to-gray-900 items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        <LoginCarousel />
      </div>
    </div>
  );
};

export default LoginPage;