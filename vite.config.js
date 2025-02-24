/** @type {import('vite').UserConfig} */
export default {
  base: process.env.DEPLOY_TARGET === "github" ? "/dd-wysiwyg/" : "/",
};
