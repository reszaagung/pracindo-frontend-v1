// src/features/warehouse/composables/useNavInputEntry.js
import { ref } from 'vue'

const title = ref('Input Data')
const breadcrumb = ref('Warehouse > Entry')
const customBackAction = ref(null)

export function useNavInputEntry() {

    const setNavInfo = (newTitle, newBreadcrumb = null) => {
        title.value = newTitle
        if (newBreadcrumb) {
            breadcrumb.value = newBreadcrumb
        }
    }

    const setCustomBackAction = (actionFn) => {
        customBackAction.value = actionFn
    }

    const resetNav = () => {
        title.value = 'Input Data'
        breadcrumb.value = 'Warehouse > Entry'
        customBackAction.value = null
    }

    return {
        title,
        breadcrumb,
        customBackAction,
        setNavInfo,
        setCustomBackAction,
        resetNav
    }
}