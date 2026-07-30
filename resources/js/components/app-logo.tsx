export default function AppLogo() {
    return (
        <div className="flex h-8 w-[7.625rem] items-center overflow-hidden group-data-[collapsible=icon]:w-8">
            <img
                src="/humi-wordmark.png"
                className="h-8 w-full object-contain object-left group-data-[collapsible=icon]:w-[7.625rem]"
                alt="Logo aplikasi Humi"
                width={122}
                height={32}
            />
        </div>
    );
}
