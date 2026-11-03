import {afterEach, describe, expect, test} from 'vitest';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {AgentSessionBaseSchema, AgentSessionSchema} from '../src/schemas/AgentSessionSchema.js';
import {AgentSessionModel} from '../src/models/AgentSessionModel.js';
import {AgentSessionSqliteRepository} from '../src/repository/sqlite/AgentSessionSqliteRepository.js';
import type {IAgentSessionBase} from '../src/interfaces/IAgentSession.js';
import type {IPromptContentPart} from '../src/interfaces/IAIProvider.js';

const routingFields = ['ownerAgentIdentifier', 'conversationType', 'lastResolvedAgentIdentifier'];
const legacyMessages = [{role: 'user', content: 'Hola'}];
const userContent: IPromptContentPart[] = [
    {type: 'text', text: 'Describe la imagen'},
    {type: 'image', imageUrl: 'data:image/png;base64,aW1hZ2U=', detail: 'high'},
    {type: 'text', text: ''}
];
const routedSession: IAgentSessionBase = {
    sessionId: 'router-session',
    title: 'Consulta multimodal',
    ownerAgentIdentifier: 'mainRouter',
    conversationType: 'router',
    lastResolvedAgentIdentifier: 'imageSpecialist',
    messages: [{
        role: 'user',
        content: 'Describe la imagen',
        resolvedAgentIdentifier: 'imageSpecialist',
        correlationId: 'turn-1',
        userContent,
        inputFiles: [{
            filename: 'image.png',
            filepath: '/uploads/image.png',
            mimetype: 'image/png',
            size: null,
            url: '/files/image.png'
        }]
    }, {
        role: 'assistant',
        content: 'Una imagen',
        resolvedAgentIdentifier: 'imageSpecialist',
        correlationId: 'turn-1'
    }]
};

class TestAgentSessionRepository extends AgentSessionSqliteRepository {
    get connection() {
        return this.db;
    }

    columns(): Array<{name: string, type: string}> {
        return this.db.prepare('PRAGMA table_info(AgentSession)').all();
    }
}

const databases: Array<{directory: string, repository: TestAgentSessionRepository}> = [];

function createRepository() {
    const directory = mkdtempSync(join(tmpdir(), 'agent-session-routing-'));
    const repository = new TestAgentSessionRepository(join(directory, 'test.sqlite'));
    databases.push({directory, repository});
    return repository;
}

afterEach(() => {
    for (const {directory, repository} of databases.splice(0)) {
        repository.connection.close();
        rmSync(directory, {recursive: true, force: true});
    }
});

describe('AgentSession routing schemas', () => {
    test('accepts legacy sessions without opting into routing or multimodal history', () => {
        const legacy = {sessionId: 'legacy', messages: legacyMessages};
        expect(AgentSessionBaseSchema.parse(legacy)).toEqual(legacy);
        const full = AgentSessionSchema.parse({_id: 'legacy-id', ...legacy, tenant: null, user: null});
        for (const field of routingFields) {
            expect(full).not.toHaveProperty(field);
        }
        expect(full.messages).toEqual(legacyMessages);
        expect(AgentSessionBaseSchema.parse({sessionId: 'minimal'})).toEqual({sessionId: 'minimal'});
    });

    test('preserves routing, correlation, prompt content parts and file audit descriptors', () => {
        expect(AgentSessionBaseSchema.parse(routedSession)).toEqual(routedSession);
        const full = {_id: 'session-id', ...routedSession, tenant: null, user: null};
        expect(AgentSessionSchema.parse(full)).toEqual(full);
        expect(AgentSessionBaseSchema.parse({sessionId: 'specialist', conversationType: 'specialist'}))
            .toEqual({sessionId: 'specialist', conversationType: 'specialist'});
    });

    test('rejects invalid conversation types and malformed multimodal parts', () => {
        expect(AgentSessionBaseSchema.safeParse({sessionId: 'invalid', conversationType: 'automatic'}).success).toBe(false);
        for (const part of [
            {type: 'audio', url: 'audio.wav'},
            {type: 'image'},
            {type: 'image', imageUrl: '/image.png', detail: 'invalid'},
            {type: 'text'}
        ]) {
            expect(AgentSessionBaseSchema.safeParse({
                sessionId: 'invalid',
                messages: [{role: 'user', content: 'Imagen', userContent: [part]}]
            }).success).toBe(false);
        }
    });
});

describe('AgentSession Mongo schema without a database connection', () => {
    test('keeps new fields absent on legacy documents', () => {
        const document = new AgentSessionModel({sessionId: 'legacy', messages: legacyMessages});
        expect(document.validateSync()).toBeUndefined();
        const stored = document.toObject({virtuals: false, getters: false});
        for (const field of routingFields) {
            expect(stored).not.toHaveProperty(field);
        }
        for (const field of ['resolvedAgentIdentifier', 'correlationId', 'userContent', 'inputFiles']) {
            expect(stored.messages[0]).not.toHaveProperty(field);
        }
    });

    test('retains routed multimodal messages when serialized and hydrated', () => {
        const document = new AgentSessionModel(routedSession);
        expect(document.validateSync()).toBeUndefined();
        const stored = document.toObject({virtuals: false, getters: false});
        expect(stored).toMatchObject(routedSession);
        expect(stored.messages[0].userContent).toEqual(userContent);
        expect(stored.messages[0].inputFiles).toEqual(routedSession.messages[0].inputFiles);
        const hydrated = AgentSessionModel.hydrate(stored);
        expect(hydrated.validateSync()).toBeUndefined();
        expect(hydrated.toObject({virtuals: false, getters: false})).toMatchObject(routedSession);
    });

    test('rejects unsupported conversation types and malformed content parts', () => {
        expect(new AgentSessionModel({sessionId: 'invalid', conversationType: 'automatic'}).validateSync())
            .toBeDefined();
        for (const part of [{type: 'audio'}, {type: 'image'}, {type: 'text'}]) {
            expect(new AgentSessionModel({
                sessionId: 'invalid',
                messages: [{role: 'user', content: 'Imagen', userContent: [part]}]
            }).validateSync()).toBeDefined();
        }
    });
});

describe('AgentSession SQLite routing persistence', () => {
    test('build creates a fresh table and persists and updates the complete optional contract', async () => {
        const repository = createRepository();
        repository.build();
        const columns = repository.columns();
        for (const name of routingFields) {
            expect(columns.find(column => column.name === name)?.type).toBe('TEXT');
        }
        for (const name of ['messageCount', 'inputTokens', 'outputTokens', 'tokens']) {
            expect(columns.filter(column => column.name === name)).toHaveLength(1);
        }

        const created = await repository.create(structuredClone(routedSession));
        expect(created).toMatchObject(routedSession);
        expect(AgentSessionSchema.parse(created)).toMatchObject(routedSession);
        const raw = repository.connection.prepare('SELECT * FROM AgentSession WHERE _id = ?').get(created._id);
        expect(JSON.parse(raw.messages)).toEqual(routedSession.messages);

        const messages = [...routedSession.messages, {
            role: 'assistant',
            content: 'Respuesta de otro especialista',
            resolvedAgentIdentifier: 'otherSpecialist',
            correlationId: 'turn-2'
        }];
        const updated = await repository.updatePartial(created._id, {
            lastResolvedAgentIdentifier: 'otherSpecialist', messages: structuredClone(messages)
        } as IAgentSessionBase);
        expect(updated.ownerAgentIdentifier).toBe('mainRouter');
        expect(updated.conversationType).toBe('router');
        expect(updated.lastResolvedAgentIdentifier).toBe('otherSpecialist');
        expect(updated.messages).toEqual(messages);
        expect(await repository.findById(created._id)).toEqual(updated);
    });

    test('build migrates an existing table idempotently and reads legacy rows unchanged', async () => {
        const repository = createRepository();
        repository.connection.exec(`CREATE TABLE AgentSession (
            _id TEXT PRIMARY KEY, sessionId TEXT, title TEXT, lastMessageAt TEXT,
            messages TEXT, messageCount NUMERIC, inputTokens NUMERIC,
            outputTokens NUMERIC, tokens NUMERIC, tenant TEXT, user TEXT
        )`);
        repository.connection.prepare(`INSERT INTO AgentSession
            (_id, sessionId, title, messages, messageCount, inputTokens, outputTokens, tokens)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
            .run('legacy-id', 'legacy', 'Legacy', JSON.stringify(legacyMessages), 1, 2, 3, 5);
        const originalColumns = repository.columns();
        const originalRow = repository.connection.prepare('SELECT * FROM AgentSession').get();

        repository.build();
        const migratedColumns = repository.columns();
        expect(migratedColumns).toHaveLength(originalColumns.length + routingFields.length);
        repository.build();
        expect(repository.columns()).toEqual(migratedColumns);
        const raw = repository.connection.prepare('SELECT * FROM AgentSession').get();
        expect(raw).toMatchObject(originalRow);
        for (const field of routingFields) {
            expect(raw[field]).toBeNull();
        }

        const legacy = await repository.findById('legacy-id');
        expect(legacy.messages).toEqual(legacyMessages);
        expect(legacy).toMatchObject({messageCount: 1, inputTokens: 2, outputTokens: 3, tokens: 5});
        for (const field of routingFields) {
            expect(legacy).not.toHaveProperty(field);
        }
        expect(AgentSessionSchema.parse(legacy).messages).toEqual(legacyMessages);

        const updated = await repository.updatePartial('legacy-id', {
            ownerAgentIdentifier: 'specialist', conversationType: 'specialist'
        } as IAgentSessionBase);
        expect(updated).toMatchObject({ownerAgentIdentifier: 'specialist', conversationType: 'specialist'});
        expect(updated.messages).toEqual(legacyMessages);
        expect(AgentSessionSchema.parse(updated).conversationType).toBe('specialist');
    });

    test('sessions created without routing remain opt-out after build and read', async () => {
        const repository = createRepository();
        repository.build();
        const created = await repository.create({sessionId: 'not-routed', title: 'Legacy', messages: structuredClone(legacyMessages)});
        for (const field of routingFields) {
            expect(created).not.toHaveProperty(field);
        }
        repository.build();
        const loaded = await repository.findById(created._id);
        expect(AgentSessionSchema.parse(loaded).messages).toEqual(legacyMessages);
        for (const field of routingFields) {
            expect(loaded).not.toHaveProperty(field);
        }
    });
});
