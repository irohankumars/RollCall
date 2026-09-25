import { Redirect, type Href } from 'expo-router';
export default function Page() { return <Redirect href={'/admin/attendance/issues' as Href} />; }
