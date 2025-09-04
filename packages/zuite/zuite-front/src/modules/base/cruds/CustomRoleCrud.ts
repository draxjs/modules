import {RoleCrud} from "@drax/identity-vue";

import type {
  IEntityCrud
} from "@drax/crud-share";

class CustomRoleCrud extends RoleCrud implements IEntityCrud {
  get applyFilterClass(){
    return 'bg-red'
  }

}

export default CustomRoleCrud

