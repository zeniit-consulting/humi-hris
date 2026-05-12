import { PortalAttendanceLocationPage } from './check-in';

type Props = {
    pageTitle: string;
};

export default function PortalCheckOutPage({ pageTitle }: Props) {
    return (
        <PortalAttendanceLocationPage pageTitle={pageTitle} mode="clock-out" />
    );
}
