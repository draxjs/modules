import {UserModel} from "../../models/UserModel.js";
import {
    mongoose,
    MongooseValidationErrorToValidationError,
    MongooseQueryFilter,
    MongooseSort,
    ValidationError, MongooseCastErrorToValidationError
} from "@drax/common-back"
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IUserRepository} from "../../interfaces/IUserRepository";
import {Cursor} from "mongoose";
import RoleMongoRepository from "./RoleMongoRepository.js";
import {IDraxFindOptions} from "@drax/crud-share";
import {AbstractMongoRepository} from "@drax/crud-back";

class UserMongoRepository extends AbstractMongoRepository<IUser,IUserCreate,IUserUpdate> implements IUserRepository {
    protected roleRepository: RoleMongoRepository;

    protected _searchFields = ['name','username','email','phone']
    protected _populateFields = ['role','tenant']
    protected _model = UserModel
    protected _lean = true

    constructor() {
        super()
        this.roleRepository = new RoleMongoRepository()
    }

    async create(userData: IUserCreate): Promise<IUser> {
        try{

            if(!await this.roleRepository.findById(userData.role)){
                throw new ValidationError([{field: 'role', reason: 'validation.notfound', value: userData.role}])
            }

            const user: mongoose.HydratedDocument<IUser> = new UserModel(userData)
            await user.save()
            await user.populate(this._populateFields)
            return user
        }catch (e){
            if(e instanceof mongoose.Error.ValidationError){
                throw MongooseValidationErrorToValidationError(e)
            }
            if (e instanceof mongoose.Error.CastError) {
                throw MongooseCastErrorToValidationError(e)
            }
            throw e
        }

    }

    async findByUsername(username: string): Promise<IUser> {
        const user = await UserModel
            .findOne({username: username})
            .populate(['role','tenant'])
            .lean(this._lean)
            .exec()
        return user as IUser
    }

    async findByUsernameWithPassword(username: string): Promise<IUser> {
        const user = await UserModel
            .findOne({username: username})
            .select('+password')
            .populate(['role','tenant'])
            .lean(this._lean)
            .exec()
        return user as IUser
    }

    async findByIdWithPassword(id: string): Promise<IUser> {
        const user = await UserModel.findById(id)
            .select('+password')
            .populate(['role','tenant'])
            .lean(this._lean)
            .exec()
        return user as IUser
    }

    async findByEmail(email: string): Promise<IUser> {
        const user = await UserModel
            .findOne({email: email})
            .populate(['role','tenant'])
            .lean(this._lean)
            .exec()
        return user as IUser
    }

    async findByEmailCode(code: string): Promise<IUser> {
        const user = await UserModel
            .findOne({emailCode: {$eq: code}, emailVerified: {$eq: false} })
            .populate(['role','tenant'])
            .lean(this._lean)
            .exec()
        return user as IUser
    }

    async findByPhoneCode(code: string): Promise<IUser> {
        const user = await UserModel
            .findOne({phoneCode: {$eq: code}, phoneVerified: {$eq: false} })
            .populate(['role','tenant'])
            .lean(this._lean)
            .exec()
        return user as IUser
    }

    async findByRecoveryCode(code: string): Promise<IUser> {
        const user = await UserModel
            .findOne({recoveryCode: {$eq: code}, active: {$eq: true} })
            .populate(['role','tenant'])
            .lean(this._lean)
            .exec()
        return user as IUser
    }

    async changePassword(id: string, password: string):Promise<boolean> {
        try{
        await UserModel.findOneAndUpdate({_id: id}, {password}).exec()
        return true
        }catch (e){
            console.error(e)
            return false
        }
    }

    async changeAvatar(id: string, avatar: string):Promise<boolean> {
        try{
            await UserModel.findOneAndUpdate({_id: id}, {avatar}).exec()
            return true
        }catch (e){
            console.error(e)
            return false
        }
    }

    async findCursor({
                         limit = 0,
                         orderBy = '',
                         order = false,
                         search = '',
                         filters = []
                     }: IDraxFindOptions): Promise<Cursor> {
        const query = {}

        if(search){
            if(mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            }else{
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        return UserModel.find(query).populate(['role','tenant']).limit(limit).sort(sort).cursor() as Cursor;
    }
}

export default UserMongoRepository
