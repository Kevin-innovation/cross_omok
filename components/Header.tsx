'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, isLoggedIn, isLoading, signOut, openLoginModal, openSignupModal } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-[500px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-800">Connect Four</span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.nickname}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {user?.nickname}
                </span>
              </div>
              <button
                onClick={signOut}
                className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={openLoginModal}
                className="text-sm px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                로그인
              </button>
              <button
                onClick={openSignupModal}
                className="text-sm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
