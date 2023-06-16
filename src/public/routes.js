'use strict';

let routes = [
    {path: "/", component: () => import("./components/Home.js") },

];

// exportando rutas designadas
export default routes;