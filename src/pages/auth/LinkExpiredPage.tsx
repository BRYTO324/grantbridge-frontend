import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, RefreshCw } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import type { UserRole } from '../../lib/store';

export default function LinkExpiredPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userRole: UserRole = role === 'funder' ? 'funder' : 'entrepreneur';
  
  const linkType = searchParams.get('type') || 'verification'; // 'verification' or 'password-reset'
  const isPasswordReset = linkType === 'password-reset';

  const handleResend = () => {
    if (isPasswordReset) {
      navigate(`/forgot-password/${role}`);
    } else {
      // In a real app, this would trigger a resend verification email API call
      navigate(`/verify-email/${role}`);
    }
  };

  return (
    <AuthLayout role={userRole} variant="error">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100"
        >
          <Clock size={36} className="text-amber-500" />
        </motion.div>

        <h1 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
          Link Expired
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm mx-auto">
          {isPasswordReset 
            ? 'This password reset link has expired. Reset links are valid for 1 hour. Please request a new one.'
            : 'This verification link has expired. Verification links are valid for 24 hours. Please request a new one.'
          }
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Security Note:</span> Links expire for your security. 
            {isPasswordReset 
              ? ' Password reset links are single-use and expire after 1 hour.'
              : ' Verification links expire after 24 hours.'
            }
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            onClick={handleResend} 
            icon={<RefreshCw size={17} />}
          >
            {isPasswordReset ? 'Request New Reset Link' : 'Resend Verification Email'}
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            fullWidth 
            onClick={() => navigate(`/login/${role}`)}
          >
            Back to Login
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Need help? Contact{' '}
            <a href="mailto:support@grantbridge.com" className="text-brand-600 hover:underline">
              support@grantbridge.com
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
