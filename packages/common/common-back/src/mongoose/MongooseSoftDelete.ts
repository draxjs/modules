    import {Schema} from "mongoose"
export default function(schema : Schema) {
    schema.add({
        deleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    });

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

    schema.methods.softDelete = function(callback : Function) {
        this.deleted = true;
        this.deletedAt = new Date();
        this.save(callback);
    };

    schema.methods.softRestore = function(callback : Function) {
        this.deleted = false;
        this.deletedAt = null;
        this.save(callback);
    };

    // @ts-ignore
    schema.query.isDeleted = function(cond : boolean) {
        if (typeof cond === 'undefined') {
            cond = true;
        }

        return this.find({
            deleted: cond
        });
    };
};
