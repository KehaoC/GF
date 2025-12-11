import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { authAPI, usersAPI } from '../services/api';

type AuthMode = 'login' | 'register';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert('请输入用户名和密码');
      return;
    }

    setIsLoading(true);

    try {
      // 调用真实登录 API
      const { access_token } = await authAPI.login(username, password);

      // 存储 token
      localStorage.setItem('access_token', access_token);

      // 获取用户信息
      const user = await usersAPI.getCurrentUser();
      const userData = {
        username: user.username,
        loginTime: Date.now()
      };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));

      // 跳转到 Dashboard
      navigate('/');
    } catch (error: any) {
      // 显示错误信息
      alert(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证输入
    if (!username.trim()) {
      alert('请输入用户名');
      return;
    }

    if (username.length < 3) {
      alert('用户名至少需要 3 个字符');
      return;
    }

    if (!password.trim()) {
      alert('请输入密码');
      return;
    }

    if (password.length < 6) {
      alert('密码至少需要 6 个字符');
      return;
    }

    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      // 调用注册 API（邮箱可选）
      const { access_token } = await authAPI.register(
        username,
        email.trim() || '',
        password
      );

      // 存储 token
      localStorage.setItem('access_token', access_token);

      // 获取用户信息
      const user = await usersAPI.getCurrentUser();
      const userData = {
        username: user.username,
        loginTime: Date.now()
      };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));

      // 跳转到 Dashboard
      navigate('/');
    } catch (error: any) {
      // 显示错误信息
      alert(error.message || '注册失败，请检查输入信息');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    // 清空表单
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const isLoginMode = mode === 'login';

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8576C7] to-[#6A5A9E] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="Sparkles" size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GF Creative Studio
          </h1>
          <p className="text-gray-600">
            {isLoginMode ? '登录以继续使用' : '创建新账号'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                isLoginMode
                  ? 'bg-white text-[#8576C7] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                !isLoginMode
                  ? 'bg-white text-[#8576C7] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名 {!isLoginMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Icon name="User" size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isLoginMode ? '输入用户名' : '至少 3 个字符'}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8576C7] focus:border-transparent transition-all"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email Input (仅注册时显示) */}
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 <span className="text-gray-400 text-xs">(可选)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Icon name="Mail" size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8576C7] focus:border-transparent transition-all"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码 {!isLoginMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Icon name="Lock" size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLoginMode ? '输入密码' : '至少 6 个字符'}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8576C7] focus:border-transparent transition-all"
                  disabled={isLoading}
                  autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {/* Confirm Password Input (仅注册时显示) */}
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Icon name="Lock" size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8576C7] focus:border-transparent transition-all"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#8576C7] text-white rounded-xl font-medium hover:bg-[#7463B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLoginMode ? '登录中...' : '注册中...'}
                </>
              ) : (
                <>
                  <Icon name={isLoginMode ? 'LogIn' : 'UserPlus'} size={20} />
                  {isLoginMode ? '登录' : '注册'}
                </>
              )}
            </button>
          </form>

          {/* Info Hint */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-purple-600 shrink-0 mt-0.5" />
              <div className="text-sm text-purple-900">
                {isLoginMode ? (
                  <>
                    <p className="font-medium mb-1">登录提示</p>
                    <p className="text-purple-700">
                      使用已注册的账号登录。还没有账号？点击上方「注册」按钮创建新账号。
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium mb-1">注册提示</p>
                    <p className="text-purple-700">
                      用户名至少 3 个字符，密码至少 6 个字符。邮箱可选填。
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>遇到问题？企业微信联系 <span className="font-semibold text-[#8576C7]">蔡可豪</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
