import { AuthorityPage } from './AuthorityPage';
import { editorialContent } from './authorityContent';

export default function EditorialPolicyPage() {
  return <AuthorityPage canonical="/editorial-policy/" content={editorialContent} type="policy" />;
}