class UniqueError extends Error {
    public entity: any;
    public field: any;

    constructor(message, entity, field) {
        super(message);
        this.name = 'UniqueError';
        this.entity = entity;
        this.field = field;
    }
}

export default UniqueError
