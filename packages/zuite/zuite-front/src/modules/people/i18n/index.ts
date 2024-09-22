import merge from 'deepmerge'
const paths = import.meta.glob('./*i18n.ts'); // Asegúrate que la ruta sea literal
const modules = [];
for (const path in paths) {
  const module = await paths[path]() as { default: any }
  if (typeof module.default === 'object' && module.default !== null) {
    modules.push(module.default);
  }
}
export default merge.all(modules);
