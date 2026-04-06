import {describe, test} from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {AbstractSqliteRepository} from "../../src/index.js";
import type {SqliteTableField} from "@drax/common-back";

class TestSqliteRepository extends AbstractSqliteRepository<any, any, any> {
    protected tableName: string = "TestEntity";
    protected searchFields: string[] = [];
    protected booleanFields: string[] = ["enabled"];
    protected jsonFields: string[] = ["payload", "tags"];
    protected identifier: string = "_id";
    protected populateFields = [];
    protected tableFields: SqliteTableField[] = [
        {name: "title", type: "TEXT", unique: false, primary: false},
        {name: "payload", type: "TEXT", unique: false, primary: false},
        {name: "tags", type: "TEXT", unique: false, primary: false},
        {name: "enabled", type: "INTEGER", unique: false, primary: false},
        {name: "bornAt", type: "TEXT", unique: false, primary: false},
        {name: "optional", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false}
    ];

    findRawById(id: string) {
        return this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${this.identifier} = ?`).get(id);
    }
}

describe("AbstractSqliteRepository", () => {
    test("create should normalize non-bindable sqlite values", async () => {
        const repository = new TestSqliteRepository(`/tmp/${randomUUID()}.db`);
        repository.build();

        const bornAt = new Date("2024-01-02T03:04:05.000Z");

        const created = await repository.create({
            title: "example",
            payload: {foo: "bar", count: 2},
            tags: ["a", "b"],
            enabled: true,
            bornAt,
            optional: undefined
        });

        const raw = repository.findRawById(created._id);

        assert.deepEqual(created.payload, {foo: "bar", count: 2});
        assert.deepEqual(created.tags, ["a", "b"]);
        assert.equal(created.enabled, true);
        assert.equal(created.bornAt, bornAt.toISOString());
        assert.equal(created.optional, null);
        assert.equal(raw.title, "example");
        assert.equal(raw.payload, JSON.stringify({foo: "bar", count: 2}));
        assert.equal(raw.tags, JSON.stringify(["a", "b"]));
        assert.equal(raw.enabled, 1);
        assert.equal(raw.bornAt, bornAt.toISOString());
        assert.equal(raw.optional, null);
        assert.ok(typeof raw.createdAt === "string");
        assert.ok(typeof raw.updatedAt === "string");
    });

    test("update should normalize non-bindable sqlite values", async () => {
        const repository = new TestSqliteRepository(`/tmp/${randomUUID()}.db`);
        repository.build();

        const created = await repository.create({
            title: "initial"
        });

        const bornAt = new Date("2025-06-07T08:09:10.000Z");

        const updated = await repository.update(created._id, {
            payload: {nested: ["x"]},
            tags: ["updated"],
            enabled: false,
            bornAt,
            optional: undefined
        });

        const raw = repository.findRawById(created._id);

        assert.deepEqual(updated.payload, {nested: ["x"]});
        assert.deepEqual(updated.tags, ["updated"]);
        assert.equal(updated.enabled, false);
        assert.equal(updated.bornAt, bornAt.toISOString());
        assert.equal(updated.optional, null);
        assert.equal(raw.payload, JSON.stringify({nested: ["x"]}));
        assert.equal(raw.tags, JSON.stringify(["updated"]));
        assert.equal(raw.enabled, 0);
        assert.equal(raw.bornAt, bornAt.toISOString());
        assert.equal(raw.optional, null);
        assert.ok(typeof raw.updatedAt === "string");
    });
});
