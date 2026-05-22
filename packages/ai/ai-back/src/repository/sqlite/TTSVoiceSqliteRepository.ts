import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITTSVoiceRepository} from '../../interfaces/ITTSVoiceRepository'
import type {ITTSVoice, ITTSVoiceBase} from "../../interfaces/ITTSVoice";
import {SqliteTableField} from "@drax/common-back";

class TTSVoiceSqliteRepository extends AbstractSqliteRepository<ITTSVoice, ITTSVoiceBase, ITTSVoiceBase> implements ITTSVoiceRepository {

    protected db: any;
    protected tableName: string = 'TTSVoice';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'ttsProvider', 'voiceId', 'model', 'languageCode'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        {field: 'tenant', table: 'tenant', identifier: '_id'},
        {field: 'user', table: 'user', identifier: '_id'}
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: false, primary: false},
        {name: "ttsProvider", type: "TEXT", unique: false, primary: false},
        {name: "voiceId", type: "TEXT", unique: false, primary: false},
        {name: "model", type: "TEXT", unique: false, primary: false},
        {name: "languageCode", type: "TEXT", unique: false, primary: false},
        {name: "tenant", type: "TEXT", unique: false, primary: false},
        {name: "user", type: "TEXT", unique: false, primary: false}
    ]

}

export default TTSVoiceSqliteRepository
export {TTSVoiceSqliteRepository}
