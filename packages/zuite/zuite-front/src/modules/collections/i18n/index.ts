
import merge from "deepmerge";
import CovenantMessages from "./Covenant-i18n"
import GroupZoneMessages from "./GroupZone-i18n"

const messages = merge.all([
    CovenantMessages,
    GroupZoneMessages
])

export default messages
