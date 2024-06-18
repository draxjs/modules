import { GraphQLError } from 'graphql';
import ValidationError from '../ValidationError.js';

function ValidationErrorToGraphQLError(validationError: ValidationError) {
    return new GraphQLError('BAD_USER_INPUT', {
        extensions: {
            code: 'BAD_USER_INPUT',
            inputErrors: validationError.errors
        },
    });

}

export default ValidationErrorToGraphQLError
