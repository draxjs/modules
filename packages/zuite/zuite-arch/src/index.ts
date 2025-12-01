import {ArchGenerator} from '@drax/arch';
import PersonSchema from './schemas/people/PersonSchema';
import CountrySchema from './schemas/people/CountrySchema';
import LanguageSchema from './schemas/people/LanguageSchema';
import UserSessionSchema from './schemas/identity/UserSessionSchema';
import UserLoginFailSchema from './schemas/identity/UserLoginFailSchema';
import DashboardSchema from './schemas/dashboard/DashboardSchema';
import AuditSchema from './schemas/audit/AuditSchema';
// import PetSchema from './schemas/PetSchema';
// import DynamicFormSchema from './schemas/DynamicFormSchema';

const schemas = [PersonSchema, CountrySchema, LanguageSchema, UserSessionSchema, UserLoginFailSchema, DashboardSchema, AuditSchema];

const generator = new ArchGenerator(schemas);
generator.build()
