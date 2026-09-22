import { InformationPage } from '@/lecturer/information-page';

export default function ProductInformation() {
  return <InformationPage title="About RollCall" subtitle="Product information" introduction="RollCall helps lecturers prepare, run, and review attendance for institution-managed classes." sections={[
    { title: 'Designed for teaching work', body: 'The lecturer experience keeps class schedules, attendance sessions, student lists, and review tools close together without introducing unrelated administration.' },
    { title: 'Institution-managed', body: 'Accounts, class assignments, and access are provided by the lecturer’s institution. Availability can depend on institutional configuration.' },
  ]} />;
}
