import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/canvas');
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-[#0d161c] dark:text-white antialiased overflow-x-hidden transition-colors duration-300 min-h-screen flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern dark:bg-grid-pattern-dark bg-grid opacity-[0.6] dark:opacity-[0.3]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-background-light dark:from-background-dark dark:via-transparent dark:to-background-dark"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-[440px] px-6">
        <div className="bg-white dark:bg-[#152028] rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="flex items-center justify-center size-14 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 mb-5">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0d161c] dark:text-white mb-2">
                Prof Charleno Canvas
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Secure node-based environment
              </p>
            </div>
            
            <div className="space-y-8">
              <button 
                onClick={handleLogin}
                className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-white dark:bg-[#1e2936] px-6 py-4 text-base font-bold text-[#0d161c] dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-[#2a3644] hover:ring-slate-300 dark:hover:ring-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#101b22]"
              >
                <img 
                  alt="Google G Logo" 
                  className="h-6 w-6" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv04BWmIPKqyFP6uvjErMuHF26DuhQtWDr_C-cxqWlAC1y0MBf6oIDvZws682E4kUrLMzk1k4WmU97hpI_IcLLlRWdZQ-564Lk31t0XbsRjHRToKBgqU_DwXyBqqsoFWRTAQniGG6681k4GGnWNLvK_cD8kDn93oXE7Ic51-sZBZeQlUI-XD3oRololX5NC8zlB2CJg7-dfKmA-tat_qBnihPdgOw8RhpJUrrqEBYStyc_CXl-M7mmBhpGS3hsDZnidKqFuhBRVbiq"
                />
                <span>Sign in with Google</span>
              </button>
              
              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                  Organize and evaluate group connections directly on your interactive canvas using your institutional account.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-[#1a252e] py-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-center">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-4 text-sm text-slate-400 dark:text-slate-500">
          <p>© 2023 Prof Charleno Canvas.</p>
          <div className="flex gap-6">
            <a className="font-medium hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-medium hover:text-primary transition-colors" href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;