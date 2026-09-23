import { AuthorityPage } from './AuthorityPage';
import { teamContent } from './authorityContent';

export default function EditorialTeamPage() {
  return <AuthorityPage canonical="/authors/editorial-team/" content={teamContent} type="team" />;
}