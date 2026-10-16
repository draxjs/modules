import {mongoose} from "@drax/common-back";
import type {Model} from 'mongoose';
import type {IRefreshTokenRecord, IRefreshTokenRepository} from "../../interfaces/IRefreshTokenRepository.js";

const schema = new mongoose.Schema<IRefreshTokenRecord & {_id: string}>({
    _id: {type: String, required: true},
    tokenHash: {type: String, required: true, unique: true},
    userId: {type: String, required: true},
    session: {type: String, required: true},
    passwordFingerprint: {type: String, required: true},
    expiresAt: {type: Number, required: true}
}, {versionKey: false});

// The hash is the document key, so uniqueness does not depend on async index creation.
const model: Model<IRefreshTokenRecord & {_id: string}> = mongoose.models.IdentityRefreshToken as Model<IRefreshTokenRecord & {_id: string}>
    || mongoose.model('IdentityRefreshToken', schema, 'identity_refresh_tokens');

class RefreshTokenMongoRepository implements IRefreshTokenRepository {
    async create(record: IRefreshTokenRecord): Promise<void> {
        await model.create({...record, _id: record.tokenHash});
    }

    async find(tokenHash: string): Promise<IRefreshTokenRecord | null> {
        return await model.findOne({tokenHash}).lean().exec() as IRefreshTokenRecord | null;
    }

    async rotate(tokenHash: string, nextHash: string, now: number): Promise<boolean> {
        // Single-document compare-and-swap is atomic, including across server instances.
        const result = await model.updateOne({tokenHash, expiresAt: {$gt: now}}, {$set: {tokenHash: nextHash}}).exec();
        return result.modifiedCount === 1;
    }

    async revoke(tokenHash: string): Promise<void> {
        await model.deleteOne({tokenHash}).exec();
    }
}

export default RefreshTokenMongoRepository;
