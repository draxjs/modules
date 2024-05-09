const ApolloErrorPlugin = {
    async requestDidStart() {
        return {
            async parsingDidStart() {
                return async (err) => {
                    if (err) {
                        console.error(err);
                    }
                };
            },
            async validationDidStart() {
                // This end hook is unique in that it can receive an array of errors,
                // which will contain every validation error that occurred.
                return async (errs) => {
                    if (errs) {
                        errs.forEach((err) => console.error(err));
                    }
                };
            },
            async executionDidStart() {
                return {
                    async executionDidEnd(err) {
                        if (err) {
                            console.error(err);
                        }
                    },
                };
            },
        };
    },
};
export default ApolloErrorPlugin;
