import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function authenticate(formData: FormData) {
  'use server';
  
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciais inválidas.';
        default:
          return 'Algo deu errado.';
      }
    }
    throw error;
  }
}

export default function LoginPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex min-h-screen">
        {/* Lado direito - Formulário de login */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Koerner 360</h1>
              <p className="mt-2 text-sm text-gray-600">
                Sistema de Gestão de Atendentes
              </p>
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-center">
                  Digite suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={authenticate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      defaultValue="admin@koerner360.com"
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Sua senha"
                      defaultValue="admin123"
                      required
                      className="h-11"
                    />
                  </div>

                  <Button type="submit" className="w-full h-11">
                    Entrar no Sistema
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Usuários de demonstração */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-sm text-gray-700 mb-3 text-center">
                  Usuários de Demonstração
                </h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="font-medium">👑 Admin:</span>
                    <span>admin@koerner360.com / admin123</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="font-medium">👥 Supervisor:</span>
                    <span>supervisor@koerner360.com / super123</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="font-medium">👤 Atendente:</span>
                    <span>atendente@koerner360.com / atend123</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}