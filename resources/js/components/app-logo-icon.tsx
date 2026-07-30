import type { ComponentProps } from 'react';

export default function AppLogoIcon(props: ComponentProps<'img'>) {
    const className = props.className ?? '';

    return (
        <>
            <img
                {...props}
                src="/logo-light.png"
                className={`${className} dark:hidden`}
                alt={props.alt ?? 'Logo aplikasi'}
            />
            <img
                {...props}
                src="/logo-dark.png"
                className={`${className} hidden dark:block`}
                alt={props.alt ?? 'Logo aplikasi'}
            />
        </>
    );
}
