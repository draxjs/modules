import {UserModel} from "../../models/UserModel.js";
import {
    mongoose,
    MongooseErrorToValidationError,
    MongooseQueryFilter, MongooseSort,
    MongoServerErrorToValidationError,
    ValidationError
} from "@drax/common-back"
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import {DeleteResult, MongoServerError} from "mongodb";
import type {IUserRepository} from "../../interfaces/IUserRepository";
import {Cursor, PaginateResult} from "mongoose";
import RoleMongoRepository from "./RoleMongoRepository.js";
import {IDraxFindOptions, IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {IRole, ITenant} from "@drax/identity-share";
import type {IDraxFieldFilter} from "@drax/crud-share/dist";

class UserMongoRepository implements IUserRepository {
    private roleRepository: RoleMongoRepository;
    _searchFields = ['name','username','email','phone']

    constructor() {
        this.roleRepository = new RoleMongoRepository()
    }

    async create(userData: IUserCreate): Promise<IUser> {
        try{

            if(!await this.roleRepository.findById(userData.role)){
                throw new ValidationError([{field: 'role', reason: 'validation.notfound', value: userData.role}])
            }

            const user: mongoose.HydratedDocument<IUser> = new UserModel(userData)
            await user.save()
            await user.populate(['role','tenant'])
            return user
        }catch (e){
            if(e instanceof mongoose.Error.ValidationError){
                throw MongooseErrorToValidationError(e)
            }
            throw e
        }

    }

    async update(id: string, userData: IUserUpdate): Promise<IUser> {
        try{
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOneAndUpdate({_id: id}, userData, {new: true}).populate(['role','tenant']).exec()
        return user
        }catch (e){
            if(e instanceof mongoose.Error.ValidationError){
                throw MongooseErrorToValidationError(e)
            }
            if(e instanceof MongoServerError || e.name === 'MongoServerError'){
                throw MongoServerErrorToValidationError(e)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        const result: DeleteResult = await UserModel.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }


    async findById(id:string): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findById(id).populate(['role','tenant']).exec()
        return user
    }

    async findByUsername(username: string): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOne({username: username}).populate(['role','tenant']).exec()
        return user
    }

    async findByEmail(email: string): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOne({email: email}).populate(['role','tenant']).exec()
        return user
    }

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       order= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<IUser>> {

        const query = {}

        if(search){
            query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        const options = {populate: ['role','tenant'], page, limit, sort }

        const userPaginated: PaginateResult<IUser> = await UserModel.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: userPaginated.totalDocs,
            items: userPaginated.docs
        }
    }


    async search(value: string, limit: number = 1000, filters: IDraxFieldFilter[] = []): Promise<IUser[]> {
        const query = {}
        if(value){
            query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(value.toString(), 'i')}))
        }
        MongooseQueryFilter.applyFilters(query, filters)
        const items: mongoose.HydratedDocument<IUser>[] = await UserModel.find(query).limit(limit).exec()
        return items
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

    async find({
                   limit = 0,
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<IUser[]> {

        const query = {}

        if (search) {
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        return await UserModel.find(query).populate(['role','tenant']).limit(limit).sort(sort)
    }

    async findCursor({
                         limit = 0,
                         orderBy = '',
                         order = false,
                         search = '',
                         filters = []
                     }: IDraxFindOptions): Promise<Cursor> {
        console.log("RoleMongoRepository.findCursor called")
        const query = {}

        if (search) {
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        return UserModel.find(query).populate(['role','tenant']).limit(limit).sort(sort).cursor() as Cursor;
    }
}

export default UserMongoRepository
