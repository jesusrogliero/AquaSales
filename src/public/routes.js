'use strict';

let routes = [
    {path: "/", component: () => import("./components/Home.js") },
    {path: "/products", component: () => import("./components/Products.js") },
    {path: "/sales", component: () => import("./components/Sales.js") },
    {path: "/payments", component: () => import("./components/Payments.js") },
    {path: "/new_sale", component: () => import("./components/NewSale.js") },
    {path: "/dispatched_sales", component: () => import("./components/DispatchedSales.js") },
    {path: "/report_sumary", component: () => import("./components/SumarySales.js") },
];

// exportando rutas designadas
export default routes;