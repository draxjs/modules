import {Schema} from "mongoose"
export default function(schema : any) {
    schema.add({ deleted: Boolean });
    schema.add({ deletedAt: Date });

    schema.pre('save', function (next : Function) {
        // @ts-ignore
        if (!this.deleted) {
            // @ts-ignore
            this.deleted = false;
        }
        // @ts-ignore
        if (!this.deletedAt) {
            // @ts-ignore
            this.deletedAt = null;
        }

        next();
    });

    schema.methods.softdelete = function(callback : Function) {
        this.deleted = true;
        this.deletedAt = new Date();
        this.save(callback);
    };

    schema.methods.restore = function(callback : Function) {
        this.deleted = false;
        this.deletedAt = null;
        this.save(callback);
    };

    schema.query.isDeleted = function(cond : boolean) {
        if (typeof cond === 'undefined') {
            cond = true;
        }

        return this.find({
            deleted: cond
        });
    };
};
