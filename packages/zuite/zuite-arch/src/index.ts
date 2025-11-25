import {ArchGenerator} from '@drax/arch';
import PersonSchema from './schemas/PersonSchema';
import CountrySchema from './schemas/CountrySchema';
import LanguageSchema from './schemas/LanguageSchema';
import UserSessionSchema from './schemas/UserSessionSchema';
import UserLoginFailSchema from './schemas/UserLoginFailSchema';
// import PetSchema from './schemas/PetSchema';
// import DynamicFormSchema from './schemas/DynamicFormSchema';

const schemas = [PersonSchema, CountrySchema, LanguageSchema, UserSessionSchema, UserLoginFailSchema];

const generator = new ArchGenerator(schemas);
generator.build()
