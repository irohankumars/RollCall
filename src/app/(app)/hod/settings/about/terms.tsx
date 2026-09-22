import { InformationPage } from '@/hod/information-page';

export default function TermsInformation() {
  return <InformationPage title="Terms" subtitle="Terms information" introduction="Approved terms are not included in this frontend build. Terms must be reviewed and published before production use." sections={[
    { title: 'Current status', body: 'This page is a transparent placeholder for approved institutional and product terms. It does not create or replace a legal agreement.', notice: true },
    { title: 'Before deployment', body: 'The deploying institution should review applicable use, access, retention, support, and accountability requirements with qualified advisers.' },
  ]} />;
}

