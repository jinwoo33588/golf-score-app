import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  nickname:     z.string().min(2, '닉네임은 2자 이상이어야 합니다'),
  email:        z.string().email('올바른 이메일을 입력하세요'),
  password:     z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  distanceUnit: z.enum(['meter', 'yard']),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { distanceUnit: 'meter' },
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => { login(data.token, data.user); navigate('/dashboard'); },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl">⛳</div>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>Golf Score 계정을 만드세요</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>닉네임</Label>
              <Input placeholder="골프왕" {...register('nickname')} />
              {errors.nickname && <p className="text-xs text-destructive">{errors.nickname.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input type="email" placeholder="golf@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>비밀번호</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>거리 단위</Label>
              <Select defaultValue="meter" onValueChange={(v) => setValue('distanceUnit', v as 'meter' | 'yard')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meter">미터 (m)</SelectItem>
                  <SelectItem value="yard">야드 (yd)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mutation.isError && (
              <p className="text-xs text-destructive text-center">회원가입에 실패했습니다</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? '가입 중...' : '회원가입'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">로그인</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
