import { PageTemplateContent } from './page-template-content';

/**
 * Model used to handle page template in SPA Mode
 * IBE+
 */
export interface PageTemplate {
  id: string;
  culture: string;
  name: string;
  path: string;
  content: PageTemplateContent;
}
