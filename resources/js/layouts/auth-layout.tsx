import SeoHead from '@/components/seo-head';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    const metaTitle = `${title} | Humi HRIS`;
    const metaDescription =
        description ||
        'Masuk ke Humi HRIS untuk mengelola absensi, cuti, payroll, dan data karyawan.';

    return (
        <>
            <AuthLayoutTemplate
                title={title}
                description={description}
                {...props}
            >
                {children}
            </AuthLayoutTemplate>
            <SeoHead title={metaTitle} description={metaDescription} noIndex />
        </>
    );
}
