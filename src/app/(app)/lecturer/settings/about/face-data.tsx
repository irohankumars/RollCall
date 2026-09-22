import { InformationPage } from '@/lecturer/information-page';

export default function FaceDataInformation() {
  return <InformationPage title="Face Data & Privacy" subtitle="Purpose and handling" introduction="Face recognition is used as one step in an authorised attendance session on supported devices." sections={[
    { title: 'Purpose limitation', body: 'Only information needed for verification and attendance should be handled. It should not be reused for an unrelated purpose.', notice: true },
    { title: 'Raw footage', body: 'Unnecessary raw classroom footage should not be retained.' },
    { title: 'Retention and deletion', body: 'Retention and deletion information must be defined and made available by the deploying institution.' },
    { title: 'Review required', body: 'Final privacy and legal requirements require institutional and jurisdictional review. This screen does not claim compliance.' },
  ]} />;
}
