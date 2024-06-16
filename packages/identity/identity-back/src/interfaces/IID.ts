import {mongoose} from "@drax/common-back";
import {UUID} from "crypto";

export type IID = mongoose.Types.ObjectId | UUID | string | number | `${string}-${string}-${string}-${string}-${string}`;

