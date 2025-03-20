const QueryFilterRegex = /^(?:[a-zA-Z0-9_]+;(?:eq|like|ne|in|nin|gt|gte|lt|lte);[a-zA-Z0-9_]+)(?:\|[a-zA-Z0-9_]+;(?:eq|like|ne|in|nin|gt|gte|lt|lte);[a-zA-Z0-9_]+)*$/

export default QueryFilterRegex
export {QueryFilterRegex}
