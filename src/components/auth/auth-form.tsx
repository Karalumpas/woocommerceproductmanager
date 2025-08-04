'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { useToast } from '../../hooks/use-toast'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

interface AuthFormProps {
  onSuccess?: (user: any) => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: '',
  })
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${data.user.username}`,
        })
        
        if (onSuccess) {
          onSuccess(data.user)
        } else {
          // Check if user has shops, redirect accordingly
          const shopsResponse = await fetch('/api/shops')
          const shops = await shopsResponse.json()
          
          if (shops.length === 0) {
            router.push('/connections')
          } else {
            router.push('/dashboard')
          }
        }
      } else {
        const error = await response.json()
        toast({
          title: "Login failed",
          description: error.error || 'Invalid credentials',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: 'Something went wrong. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: 'Passwords do not match',
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerData.email,
          username: registerData.username,
          password: registerData.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Account created!",
          description: `Welcome ${data.user.username}! Your account has been created.`,
        })
        
        if (onSuccess) {
          onSuccess(data.user)
        } else {
          router.push('/connections')
        }
      } else {
        const error = await response.json()
        toast({
          title: "Registration failed",
          description: error.error || 'Failed to create account',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: 'Something went wrong. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">WooCommerce Manager</CardTitle>
          <CardDescription>
            Manage your WooCommerce products across multiple stores
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrUsername">Email or Username</Label>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="Enter your email or username"
                    value={loginData.emailOrUsername}
                    onChange={(e) => setLoginData(prev => ({ ...prev, emailOrUsername: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="loginPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Logging in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="registerPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Choose a password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
