import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { signIn, getRedirectPath } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeInput, isValidEmail } from '@/lib/security';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { authUser, loading } = useAuth();

  const sessionExpired = location.state?.expired;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!loading && authUser) {
      navigate(getRedirectPath(authUser.role), { replace: true });
    }
  }, [authUser, loading, navigate]);

  useEffect(() => {
    if (sessionExpired) {
      toast({
        title: 'Session Expired',
        description: 'Your session has expired. Please login again.',
        variant: 'destructive',
      });
    }
  }, [sessionExpired, toast]);

  const onSubmit = async (data: LoginForm) => {
    setLoginError(null);

    // Validate email format
    const sanitizedEmail = sanitizeInput(data.email.toLowerCase());
    if (!isValidEmail(sanitizedEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(sanitizedEmail, data.password);
      setAttempts(0);
      toast({
        title: 'Welcome back!',
        description: 'Login successful',
      });
    } catch (error: any) {
      setAttempts(prev => prev + 1);
      
      // Generic error message to prevent user enumeration
      const errorMessage = attempts >= 2 
        ? 'Invalid credentials. Please check your email and password.'
        : 'Login failed. Please try again.';
      
      setLoginError(errorMessage);
      
      // Don't expose specific error details
      console.error('Login error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
         <img 
            src="/favicon.jpg" 
            alt="company-logo" 
            className="w-24 sm:w-28 md:w-32 lg:w-36 mx-auto rounded-lg" 
          />

        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Enter your email"
                          className="pl-10"
                          autoComplete="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck="false"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          autoComplete="current-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              <p className='text-center text-sm'>If you forgot you password Contact administrator</p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
