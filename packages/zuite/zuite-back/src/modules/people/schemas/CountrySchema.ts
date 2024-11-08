
import { z } from 'zod';

const CountrySchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().min(1,'validation.required'),
    flag: z.string()
});

export default CountrySchema;
export {CountrySchema}
