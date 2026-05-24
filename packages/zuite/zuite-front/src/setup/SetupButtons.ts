
import {configureCrudButtons} from "@drax/crud-vue";

function setupButtons(){
    configureCrudButtons({
        defaults: {
            variant: "elevated",
            rounded: 0,
            color: "deep-purple-accent-4",
        },
        buttons: {
            ai: {
                icon: "md:smart_toy",
                color: "pink-accent-3",
                variant: "elevated",
            },
            columns: {
                icon: "md:view_column",
                color: "cyan-darken-3",
                variant: "elevated",
            },
            create: {
                icon: "md:add_circle",
                color: "green-accent-4",
                variant: "elevated",
            },
            createOnTheFly: {
                icon: "md:bolt",
                color: "lime-darken-3",
                variant: "elevated",
            },
            delete: {
                icon: "md:delete_forever",
                color: "red-darken-4",
                variant: "elevated",
            },
            dialogNext: {
                icon: "md:arrow_circle_right",
                color: "deep-orange-accent-4",
                variant: "elevated",
            },
            dialogPrev: {
                icon: "md:arrow_circle_left",
                color: "deep-orange-accent-4",
                variant: "elevated",
            },
            export: {
                icon: "md:cloud_upload",
                color: "blue-darken-4",
                variant: "elevated",
            },
            filter: {
                icon: "md:tune",
                activeIcon: "md:filter_list_off",
                color: "amber-darken-4",
                variant: "elevated",
            },
            groupBy: {
                icon: "md:bar_chart",
                color: "indigo-accent-4",
                variant: "elevated",
            },
            import: {
                icon: "md:cloud_download",
                color: "teal-darken-4",
                variant: "elevated",
            },
            openRouteForm: {
                icon: "md:open_in_new",
                color: "yellow-darken-4",
                variant: "elevated",
            },
            refresh: {
                icon: "md:sync",
                color: "orange-darken-4",
                variant: "elevated",
            },
            savedQueries: {
                icon: "md:bookmarks",
                color: "brown-darken-3",
                variant: "elevated",
            },
            update: {
                icon: "md:edit",
                color: "light-blue-darken-4",
                variant: "elevated",
            },
            view: {
                icon: "md:visibility",
                color: "purple-darken-4",
                variant: "elevated",
            },
        },
    });

}

export default setupButtons;
export { setupButtons };
