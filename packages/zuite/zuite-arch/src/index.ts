import {ArchGenerator} from '@drax/arch';
import PersonSchema from './schemas/PersonSchema';
import CountrySchema from './schemas/CountrySchema';
import LanguageSchema from './schemas/LanguageSchema';
import PetSchema from './schemas/PetSchema';

const schemas = [PersonSchema, CountrySchema, LanguageSchema, PetSchema];

const generator = new ArchGenerator(schemas);
generator.build()
