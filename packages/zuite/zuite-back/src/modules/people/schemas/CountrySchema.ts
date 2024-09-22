
import { z } from 'zod';

const CountrySchema = z.object({
      name: z.string().min(1,'validation.required')
});

export default CountrySchema;
export {CountrySchema}
