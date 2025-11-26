import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "dashboard",
    name: "Dashboard",
    schema: {
        identifier: {type: 'string', required: true, unique: true, index: true, search: true, header: true},
        title: {type: 'string', required: true, unique: true, index: true, search: true, header: true},
        cards: {
            type: 'array.object', required: false, unique: false, index: false, search: false, header: false,
            schema: {
                entity: {type: 'string', required: true, unique: false, index: false},
                type: {type: 'enum', enum: ['paginate', 'groupBy'], required: true, unique: false, index: false},
                title: {type: 'string', required: true, unique: false, index: false},
                filters: {
                    type: 'array.object', required: false, unique: false, index: false,
                    schema: {
                        field: {type: 'string', required: true, unique: false, index: false},
                        operator: {type: 'string', required: true, unique: false, index: false},
                        value: {type: 'string', required: true, unique: false, index: false},
                    }
                },
                layout: {
                    type: 'object', required: false, unique: false, index: false,
                    schema: {
                        cols: {type: 'number', required: true, unique: false, index: false, default: 12},
                        sm: {type: 'number', required: true, unique: false, index: false, default: 12},
                        md: {type: 'number', required: true, unique: false, index: false, default: 12},
                        lg: {type: 'number', required: true, unique: false, index: false, default: 12},
                        height: {type: 'number', required: true, unique: false, index: false, default: 100},
                        cardVariant: {type: 'enum', enum: ['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain'], required: true, unique: false, index: false, default: 'elevated'},
                    }
                },
                groupBy: {
                    type: 'object', required: false, unique: false, index: false,
                    schema: {
                        fields: {type: 'array.string', required: true, unique: false, index: false},
                        dateFormat: {
                            type: 'enum',
                            enum: ['year', 'month', 'day', 'hour', 'minute', 'second'],
                            default: 'day',
                            required: false,
                            unique: false,
                            index: false
                        },
                        render: {
                            type: 'enum',
                            enum: ['table', 'gallery', 'pie', 'bars'],
                            default: 'day',
                            required: false,
                            unique: false,
                            index: false
                        },
                    }
                },
                paginate: {
                    type: 'object', required: false, unique: false, index: false,
                    schema: {
                        columns: {type: 'array.string', default: [], required: true, unique: false, index: false},
                        orderBy: {type: 'string', required: false, unique: false, index: false},
                        order: {type: 'enum', enum: ['asc', 'desc'], required: false, unique: false, index: false},
                    }
                }
            }

        },
    }
}


export default schema;
export {schema};
