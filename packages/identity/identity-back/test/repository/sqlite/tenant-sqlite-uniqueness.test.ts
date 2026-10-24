import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import sqlite from 'better-sqlite3';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {ValidationError} from '@drax/common-back';
import TenantSqliteRepository from '../../../src/repository/sqlite/TenantSqliteRepository';

describe('Tenant SQLite name uniqueness', () => {
    let directory: string;
    let file: string;
    let db: ReturnType<typeof sqlite>;
    let repositories: TenantSqliteRepository[];

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'drax-tenant-unique-'));
        file = join(directory, 'tenants.sqlite');
        db = new sqlite(file);
        repositories = [];
    });

    afterEach(() => {
        for (const repository of repositories) {
            (repository as any).db.close();
        }
        db.close();
        rmSync(directory, {recursive: true, force: true});
    });

    function repository() {
        const instance = new TenantSqliteRepository(file);
        repositories.push(instance);
        return instance;
    }

    function legacyTable() {
        db.exec(`CREATE TABLE tenants (_id TEXT PRIMARY KEY, name TEXT, createdAt TEXT, updatedAt TEXT)`);
    }

    function uniqueError(name: string) {
        return {
            name: 'ValidationError',
            statusCode: 422,
            errors: [{field: 'name', value: name, reason: 'validation.unique'}]
        };
    }

    it('rejects duplicate creates with the repository validation error', async () => {
        const tenants = repository();
        tenants.build();
        await tenants.create({name: 'Company'});
        const failure = tenants.create({name: 'Company'});
        await expect(failure).rejects.toBeInstanceOf(ValidationError);
        await expect(failure).rejects.toMatchObject(uniqueError('Company'));
        expect(await tenants.fetchAll()).toHaveLength(1);
    });

    it('rejects conflicting updates and partial updates without changing either tenant', async () => {
        const tenants = repository();
        tenants.build();
        const first = await tenants.create({name: 'First'});
        const second = await tenants.create({name: 'Second'});
        await expect(tenants.update(second._id, {name: first.name})).rejects.toMatchObject(uniqueError('First'));
        await expect(tenants.updatePartial(second._id, {name: first.name})).rejects.toMatchObject(uniqueError('First'));
        expect((await tenants.findById(second._id)).name).toBe('Second');
        expect((await tenants.update(first._id, {name: first.name})).name).toBe('First');
    });

    it('keeps names exact and case-sensitive without trimming in the repository', async () => {
        const tenants = repository();
        tenants.build();
        for (const name of ['Company', 'company', ' Company ', 'Café', 'Cafe\u0301']) {
            await tenants.create({name});
            expect((await tenants.findByName(name))?.name).toBe(name);
        }
        expect(await tenants.fetchAll()).toHaveLength(5);
    });

    it('allows only one competing create across independent repository connections', async () => {
        const first = repository();
        const second = repository();
        first.build();
        second.build();
        const results = await Promise.allSettled([
            first.create({name: 'Concurrent'}),
            second.create({name: 'Concurrent'})
        ]);
        expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
        const failure = results.find(result => result.status === 'rejected') as PromiseRejectedResult;
        expect(failure.reason).toBeInstanceOf(ValidationError);
        expect(failure.reason).toMatchObject(uniqueError('Concurrent'));
        expect(await first.fetchAll()).toHaveLength(1);
    });

    it('allows only one competing rename across independent connections', async () => {
        const first = repository();
        const second = repository();
        first.build();
        second.build();
        const a = await first.create({name: 'A'});
        const b = await second.create({name: 'B'});
        const results = await Promise.allSettled([
            first.update(a._id, {name: 'Target'}),
            second.updatePartial(b._id, {name: 'Target'})
        ]);
        expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
        const failure = results.find(result => result.status === 'rejected') as PromiseRejectedResult;
        expect(failure.reason).toMatchObject(uniqueError('Target'));
        expect(db.prepare('SELECT COUNT(*) AS count FROM tenants WHERE name = ?').get('Target')).toEqual({count: 1});
    });

    it('upgrades an existing table non-destructively and survives repeated builds and reopening', async () => {
        legacyTable();
        db.prepare('INSERT INTO tenants VALUES (?, ?, ?, ?)').run('legacy', 'Company', 'created', 'updated');
        db.prepare('INSERT INTO tenants VALUES (?, ?, ?, ?)').run('case', 'company', null, null);
        const before = db.prepare('SELECT * FROM tenants ORDER BY _id').all();
        const tenants = repository();
        tenants.build();
        tenants.build();
        const reopened = repository();
        reopened.build();
        expect(db.prepare('SELECT * FROM tenants ORDER BY _id').all()).toEqual(before);
        await expect(reopened.create({name: 'Company'})).rejects.toMatchObject(uniqueError('Company'));
        // The database, not a repository pre-check, must enforce uniqueness for every writer.
        expect(() => db.prepare('INSERT INTO tenants (_id, name) VALUES (?, ?)').run('raw', 'Company'))
            .toThrow('UNIQUE constraint failed: tenants.name');
        expect(db.prepare("PRAGMA index_list('tenants')").all()).toEqual(expect.arrayContaining([
            expect.objectContaining({name: 'tenants_name_unique', unique: 1})
        ]));
    });

    it('fails actionably on legacy duplicates, preserves all data, and can retry after manual resolution', () => {
        legacyTable();
        db.exec("INSERT INTO tenants VALUES ('a', 'Duplicate', 'created-a', 'updated-a'), ('b', 'Duplicate', 'created-b', 'updated-b')");
        const before = db.prepare('SELECT * FROM tenants ORDER BY _id').all();
        const tenants = repository();
        expect(() => tenants.build()).toThrow(/duplicate names.*SELECT.*GROUP BY.*Resolve these duplicates manually/s);
        expect(() => tenants.build()).toThrow(/No tenants were deleted or renamed/);
        expect(db.prepare('SELECT * FROM tenants ORDER BY _id').all()).toEqual(before);
        expect(db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'tenants_name_unique'").get()).toBeUndefined();
        db.prepare('UPDATE tenants SET name = ? WHERE _id = ?').run('Resolved manually', 'b');
        expect(() => tenants.build()).not.toThrow();
        expect(db.prepare('SELECT COUNT(*) AS count FROM tenants').get()).toEqual({count: 2});
    });
});
