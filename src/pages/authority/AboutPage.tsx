import { AuthorityPage } from './AuthorityPage';
import { aboutContent } from './authorityContent';

export default function AboutPage() {
  return <AuthorityPage canonical="/about/" content={aboutContent} type="about" />;
}