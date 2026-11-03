
import {Readable} from "node:stream";
import AgentSessionServiceFactory from "../factory/services/AgentSessionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import {BadRequestError, ForbiddenError, NotFoundError} from "@drax/common-back";
import {DraxAgent} from "../agents/DraxAgent.js";
import {DraxAgentError} from "../agents/DraxAgentError.js";
import AgentSessionPermissions from "../permissions/AgentSessionPermissions.js";
import type {IAgentSession, IAgentSessionBase} from "../interfaces/IAgentSession";

class AgentSessionController extends AbstractFastifyController<IAgentSession, IAgentSessionBase, IAgentSessionBase>   {

    constructor() {
        super(AgentSessionServiceFactory.instance, AgentSessionPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;

        // Local facade only: internal agent writes must keep using the unwrapped singleton.
        this.service = new Proxy(this.service, {
            get: (target, property) => {
                if (property === "create") {
                    return (payload: IAgentSessionBase) => {
                        this.assertLegacyPayload(payload);
                        this.assertSessionId(payload.sessionId);
                        return DraxAgent.withSessionReservation(payload.sessionId, async () => {
                            await this.assertLegacyCreatable(payload);
                            return target.create(payload);
                        });
                    };
                }
                if (property === "update" || property === "updatePartial") {
                    return (id: string, payload: IAgentSessionBase) => this.withStoredSessionReservation(id, session => {
                        this.assertLegacyUpdatePayload(session, payload);
                        return target[property](id, payload);
                    });
                }
                if (property === "delete") {
                    return (id: string) => this.withStoredSessionReservation(id, () => target.delete(id));
                }
                const value = Reflect.get(target, property, target);
                return typeof value === "function" ? value.bind(target) : value;
            },
        });
    }

    override handleError(error: unknown, reply: any) {
        if (error instanceof DraxAgentError && error.code === "SESSION_BUSY") {
            return reply.status(error.statusCode).send({message: error.message,
                error: {code: error.code, message: error.message, stage: error.stage}});
        }
        return super.handleError(error, reply);
    }

    private async withStoredSessionReservation<T>(id: string, action: (session: IAgentSession) => Promise<T>): Promise<T> {
        const initial = await this.service.findById(id);
        if (!initial) {
            throw new NotFoundError();
        }
        const sessionId = initial.sessionId;
        this.assertSessionId(sessionId);
        return DraxAgent.withSessionReservation(sessionId, async () => {
            const session = await this.service.findById(id);
            if (!session) {
                throw new NotFoundError();
            }
            if (session.sessionId !== sessionId) {
                throw new ForbiddenError();
            }
            this.assertLegacyWritable(session);
            return action(session);
        });
    }

    private assertSessionId(sessionId: unknown): void {
        if (typeof sessionId !== "string" || !sessionId) {
            throw new BadRequestError("A session identifier is required.");
        }
    }

    /** HTTP-only policy: managed/claimed conversations are read-only, including deletion.
     * Legacy edits keep their sessionId and cannot add agent-owned metadata.
     * Create and each JSON/CSV import row may only introduce a new, unclaimed legacy id.
     * Internal AgentSessionService writes intentionally do not pass through these guards.
     */
    override async import(request: any, reply: any) {
        const guardedRequest = Object.create(request);
        guardedRequest.file = async () => {
            const data = await request.file();
            if (!data || (request.query.format || data.filename.split(".").pop() || "json").toUpperCase() !== "CSV") {
                return data;
            }
            data.file.setEncoding("utf8");
            let content = "";
            for await (const chunk of data.file) {
                content += chunk;
            }
            // The shared CSV parser assigns dotted paths before preCreate runs. Reject prototype paths first.
            this.assertSafeCsvHeaders(content, request.query.separator || ";");
            return {...data, file: Readable.from([content])};
        };
        return super.import(guardedRequest, reply);
    }

    private assertSafeCsvHeaders(content: string, separator: string): void {
        let header = "";
        let quoted = false;
        let hasHeaderValue = false;
        const assertHeader = () => {
            hasHeaderValue ||= header !== "";
            if (header.trim().split(".").some(part => ["__proto__", "constructor", "prototype"].includes(part))) {
                throw new BadRequestError("Unsafe session import header.");
            }
            header = "";
        };
        for (let index = 0; index < content.length; index++) {
            const char = content[index];
            if (char === '"') {
                if (quoted && content[index + 1] === '"') {
                    header += '"';
                    index++;
                } else {
                    quoted = !quoted;
                }
            } else if (!quoted && char === separator) {
                assertHeader();
            } else if (!quoted && (char === "\n" || char === "\r")) {
                assertHeader();
                // The shared parser skips empty records before selecting its header row.
                if (hasHeaderValue) {
                    return;
                }
            } else {
                header += char;
            }
        }
        assertHeader();
    }

    override async preCreate(_request: any, payload: IAgentSessionBase): Promise<IAgentSessionBase> {
        await this.assertLegacyCreatable(payload);
        return payload;
    }

    private async assertLegacyCreatable(payload: IAgentSessionBase): Promise<void> {
        this.assertLegacyPayload(payload);
        this.assertSessionId(payload.sessionId);
        if (DraxAgent.isSessionProtected(payload.sessionId)) {
            throw new ForbiddenError();
        }
        // No scope filters: an existing session in another scope must not become an import/create target.
        const existing = await this.service.findBy("sessionId", payload.sessionId, 1);
        if (existing?.length || DraxAgent.isSessionProtected(payload.sessionId)) {
            throw new ForbiddenError();
        }
    }

    override async preUpdate(request: any, payload: IAgentSessionBase): Promise<IAgentSessionBase> {
        const session = await this.service.findById(request.params.id);
        if (!session) {
            throw new NotFoundError();
        }
        this.assertLegacyWritable(session);
        this.assertLegacyUpdatePayload(session, payload);
        return payload;
    }

    override async preUpdatePartial(request: any, payload: IAgentSessionBase): Promise<IAgentSessionBase> {
        return this.preUpdate(request, payload);
    }

    override async preDelete(_request: any, session: IAgentSession): Promise<IAgentSession> {
        this.assertLegacyWritable(session);
        return session;
    }

    private assertLegacyWritable(session: IAgentSession): void {
        // Incomplete ownership metadata is protected too; HTTP cannot repair, demote or adopt it.
        if (session.ownerAgentIdentifier != null || session.conversationType != null
            || DraxAgent.isSessionProtected(session.sessionId)) {
            throw new ForbiddenError();
        }
    }

    private assertLegacyUpdatePayload(session: IAgentSession, payload: IAgentSessionBase): void {
        this.assertLegacyPayload(payload);
        if (Object.prototype.hasOwnProperty.call(payload, "sessionId") && payload.sessionId !== session.sessionId) {
            throw new BadRequestError("Session identity cannot be changed through the session CRUD API.");
        }
    }

    private assertLegacyPayload(payload: IAgentSessionBase): void {
        const reserved = ["_id", "id", "ownerAgentIdentifier", "conversationType", "lastResolvedAgentIdentifier"];
        // CSV columns can change a row's prototype; inherited metadata must not bypass this boundary.
        if (!payload || typeof payload !== "object" || Array.isArray(payload)
            || (Object.getPrototypeOf(payload) !== Object.prototype && Object.getPrototypeOf(payload) !== null)
            || reserved.some(field => field in payload)
            || Object.keys(payload).some(field => field.startsWith("$") || field.includes(".")
                || field === "__proto__" || field === "constructor" || field === "prototype")) {
            throw new BadRequestError("Session ownership and storage identity are managed by the agent backend.");
        }
    }
}

export default AgentSessionController;
export {
    AgentSessionController
}

