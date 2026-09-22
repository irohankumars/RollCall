import { InformationPage } from '@/lecturer/information-page';

export default function PrivacyInformation() {
  return <InformationPage title="Privacy Policy" subtitle="Privacy information" introduction="RollCall’s final privacy policy is not included in this frontend build. Privacy requirements must be reviewed for each institution and jurisdiction before deployment." sections={[
    { title: 'Required safeguards', body: 'The product plan requires purpose limitation, data minimization, access controls, retention rules, and a documented deletion process.', notice: true },
    { title: 'Policy status', body: 'This screen provides product guidance only. It does not make a legal compliance claim and is not a substitute for an approved institutional privacy policy.' },
  ]} />;
}
