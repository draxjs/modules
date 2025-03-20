

class MongooseTransform{


    static toObject(doc: any){
        return {
            virtuals: true,
            transform: (_, ret) => {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }

}
