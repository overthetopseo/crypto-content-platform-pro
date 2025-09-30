import { SignIn } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Sign in to your account to access the crypto content platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            redirectUrl={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect_url') || '/dashboard' : '/dashboard'}
          />
        </CardContent>
      </Card>
    </div>
  )
}