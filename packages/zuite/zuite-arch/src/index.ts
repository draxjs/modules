import {ArchGenerator} from '@drax/arch';
import PersonSchema from './schemas/PersonSchema';
import CountrySchema from './schemas/CountrySchema';
import LanguageSchema from './schemas/LanguageSchema';

const schemas = [PersonSchema, CountrySchema, LanguageSchema];

const generator = new ArchGenerator(schemas);
generator.build()
