import TTSVoiceCrudPage from "../pages/crud/TTSVoiceCrudPage.vue";

const TTSVoiceCrudRoute = [
  {
    name: 'TTSVoiceCrudPage',
    path: '/crud/ttsvoice',
    component: TTSVoiceCrudPage,
    meta: {
      auth: true,
      permission: 'ttsvoice:manage',
    }
  },
]

export default TTSVoiceCrudRoute
export { TTSVoiceCrudRoute }
