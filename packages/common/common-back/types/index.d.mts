/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import GraphqlMerger from "./utils/GraphqlMerger.mjs";
import MongooseSoftDelete from "./utils/MongooseSoftDelete.mjs";
import mongoose from "mongoose";
import { IPaginateFilter } from './interfaces/IPaginateFilter.mjs';
import { IResolvers, TypeSource } from "@graphql-tools/utils";
declare const commonTypeDefs: TypeSource;
declare const commonResolvers: IResolvers;
export { GraphqlMerger, MongooseSoftDelete, commonTypeDefs, commonResolvers, mongoose, IPaginateFilter };
//# sourceMappingURL=index.d.mts.map