'use client';

import { CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SignupSuccess() {
  return (
    <Card className="sharp bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-6 h-6 text-success" />
          <CardTitle className="editorial-title text-2xl">Account Created!</CardTitle>
        </div>
        <CardDescription>
          We've sent a confirmation email to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-md">
          <Mail className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Check your email</p>
            <p className="text-xs text-muted-foreground">
              Click the confirmation link in the email to activate your account. 
              Don't forget to check your spam folder if you don't see it.
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Once you've confirmed your email, you can sign in to your account.
          </p>
          <Link href="/login">
            <Button className="w-full sharp">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}


