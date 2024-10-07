import merge from 'deepmerge'

import Country from './Country-i18n.js'
import Language from './Language-i18n.js'
import Person from './Person-i18n.js'

export default merge.all([Country, Language, Person]);
