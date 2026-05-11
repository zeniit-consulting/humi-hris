import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';

type Props = {
    status?: string;
    otpSentTo?: string | null;
};

export default function PortalLogin({ status, otpSentTo }: Props) {
    const sendForm = useForm({
        phone: otpSentTo ?? '',
    });
    const verifyForm = useForm({
        otp: '',
    });

    const otpRequested = status === 'otp-sent' || Boolean(otpSentTo);

    return (
        <AuthLayout
            title="Masuk ke portal karyawan"
            description="Gunakan nomor WhatsApp terdaftar. Kami akan mengirim OTP untuk login."
        >
            <Head title="Portal Login" />

            <div className="space-y-6">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        sendForm.post('/portal/login/send-otp');
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Nomor WhatsApp</Label>
                        <Input
                            id="phone"
                            name="phone"
                            inputMode="tel"
                            autoFocus={!otpRequested}
                            value={sendForm.data.phone}
                            onChange={(event) =>
                                sendForm.setData('phone', event.target.value)
                            }
                            placeholder="081234567890"
                        />
                        <InputError message={sendForm.errors.phone} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={sendForm.processing}
                    >
                        {sendForm.processing && <Spinner />}
                        {otpRequested ? 'Kirim ulang OTP' : 'Kirim OTP'}
                    </Button>
                </form>

                {otpRequested ? (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            verifyForm.post('/portal/login/verify-otp');
                        }}
                        className="space-y-4 rounded-xl border border-border bg-muted/30 p-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="otp">Kode OTP</Label>
                            <InputOTP
                                id="otp"
                                maxLength={6}
                                value={verifyForm.data.otp}
                                onChange={(value) =>
                                    verifyForm.setData('otp', value)
                                }
                                containerClassName="justify-center"
                                autoFocus
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            <InputError message={verifyForm.errors.otp} />
                            <p className="text-sm text-muted-foreground">
                                OTP dikirim ke {otpSentTo ?? sendForm.data.phone}.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={verifyForm.processing}
                        >
                            {verifyForm.processing && <Spinner />}
                            Masuk ke portal
                        </Button>
                    </form>
                ) : null}

                <div className="text-center text-sm text-muted-foreground">
                    Login admin atau staf internal?{' '}
                    <TextLink href={login()}>Gunakan login utama</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
