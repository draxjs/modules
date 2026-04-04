const QueryFilterRegex = /^(?:[a-zA-Z0-9_.\-]+;(?:eq|like|ne|in|nin|gt|gte|lt|lte|empty);[a-zA-Z0-9_.\-:\., áéíóúÁÉÍÓÚ]*(?:;[a-zA-Z0-9_.\-]+)?)(?:\|[a-zA-Z0-9_.\-]+;(?:eq|like|ne|in|nin|gt|gte|lt|lte|empty);[a-zA-Z0-9_.\-:\., áéíóúÁÉÍÓÚ]*(?:;[a-zA-Z0-9_.\-]+)?)*$/

export default QueryFilterRegex
export {QueryFilterRegex}
