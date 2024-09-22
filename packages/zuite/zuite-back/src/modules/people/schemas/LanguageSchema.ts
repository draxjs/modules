
import { z } from 'zod';

const LanguageSchema = z.object({
      name: z.string().min(1,'validation.required')
});

export default LanguageSchema;
export {LanguageSchema}
