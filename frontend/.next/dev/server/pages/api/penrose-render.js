"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/penrose-render";
exports.ids = ["pages/api/penrose-render"];
exports.modules = {

/***/ "(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fpenrose-render&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fpenrose-render.js&middlewareConfigBase64=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fpenrose-render&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fpenrose-render.js&middlewareConfigBase64=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   handler: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_api_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/api-utils */ \"(api-node)/./node_modules/next/dist/server/api-utils/index.js\");\n/* harmony import */ var next_dist_server_api_utils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_api_utils__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(api-node)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/route-modules/pages-api/module.compiled */ \"(api-node)/./node_modules/next/dist/server/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api-node)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _pages_api_penrose_render_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/api/penrose-render.js */ \"(api-node)/./pages/api/penrose-render.js\");\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/server/lib/trace/tracer */ \"(api-node)/./node_modules/next/dist/server/lib/trace/tracer.js\");\n/* harmony import */ var next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/lib/trace/constants */ \"(api-node)/./node_modules/next/dist/server/lib/trace/constants.js\");\n/* harmony import */ var next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/dist/server/request-meta */ \"(api-node)/./node_modules/next/dist/server/request-meta.js\");\n/* harmony import */ var next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_7__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_pages_api_penrose_render_js__WEBPACK_IMPORTED_MODULE_4__]);\n_pages_api_penrose_render_js__WEBPACK_IMPORTED_MODULE_4__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n// Import the userland code.\n\n\n\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_3__.hoist)(_pages_api_penrose_render_js__WEBPACK_IMPORTED_MODULE_4__, 'default'));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_3__.hoist)(_pages_api_penrose_render_js__WEBPACK_IMPORTED_MODULE_4__, 'config');\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_2__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/penrose-render\",\n        pathname: \"/api/penrose-render\",\n        // The following aren't used in production.\n        bundlePath: '',\n        filename: ''\n    },\n    userland: _pages_api_penrose_render_js__WEBPACK_IMPORTED_MODULE_4__,\n    distDir: \".next/dev\" || 0,\n    relativeProjectDir:  false || ''\n});\nasync function handler(req, res, ctx) {\n    if (ctx.requestMeta) {\n        (0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_7__.setRequestMeta)(req, ctx.requestMeta);\n    }\n    if (routeModule.isDev) {\n        (0,next_dist_server_request_meta__WEBPACK_IMPORTED_MODULE_7__.addRequestMeta)(req, 'devRequestTimingInternalsEnd', process.hrtime.bigint());\n    }\n    let srcPage = \"/api/penrose-render\";\n    // turbopack doesn't normalize `/index` in the page name\n    // so we need to to process dynamic routes properly\n    // TODO: fix turbopack providing differing value from webpack\n    if (false) {}\n    const prepareResult = await routeModule.prepare(req, res, {\n        srcPage\n    });\n    if (!prepareResult) {\n        res.statusCode = 400;\n        res.end('Bad Request');\n        ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());\n        return;\n    }\n    const { query, params, prerenderManifest, routerServerContext } = prepareResult;\n    try {\n        const method = req.method || 'GET';\n        const tracer = (0,next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_5__.getTracer)();\n        const activeSpan = tracer.getActiveScopeSpan();\n        const isWrappedByNextServer = Boolean(routerServerContext == null ? void 0 : routerServerContext.isWrappedByNextServer);\n        const onRequestError = routeModule.instrumentationOnRequestError.bind(routeModule);\n        let parentSpan;\n        const invokeRouteModule = async (span)=>routeModule.render(req, res, {\n                query: {\n                    ...query,\n                    ...params\n                },\n                params,\n                allowedRevalidateHeaderKeys: [],\n                multiZoneDraftMode: Boolean(false),\n                trustHostHeader: false,\n                // TODO: get this from from runtime env so manifest\n                // doesn't need to load\n                previewProps: prerenderManifest.preview,\n                propagateError: false,\n                dev: routeModule.isDev,\n                page: \"/api/penrose-render\",\n                internalRevalidate: routerServerContext == null ? void 0 : routerServerContext.revalidate,\n                onError: (...args)=>onRequestError(req, ...args)\n            }).finally(()=>{\n                if (!span) return;\n                span.setAttributes({\n                    'http.status_code': res.statusCode,\n                    'next.rsc': false\n                });\n                const rootSpanAttributes = tracer.getRootSpanAttributes();\n                // We were unable to get attributes, probably OTEL is not enabled\n                if (!rootSpanAttributes) {\n                    return;\n                }\n                if (rootSpanAttributes.get('next.span_type') !== next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_6__.BaseServerSpan.handleRequest) {\n                    console.warn(`Unexpected root span type '${rootSpanAttributes.get('next.span_type')}'. Please report this Next.js issue https://github.com/vercel/next.js`);\n                    return;\n                }\n                const route = rootSpanAttributes.get('next.route');\n                if (route) {\n                    const name = `${method} ${route}`;\n                    span.setAttributes({\n                        'next.route': route,\n                        'http.route': route,\n                        'next.span_name': name\n                    });\n                    span.updateName(name);\n                    // Propagate http.route to the parent span if one exists (e.g.\n                    // a platform-created HTTP span in adapter deployments).\n                    if (parentSpan && parentSpan !== span) {\n                        parentSpan.setAttribute('http.route', route);\n                        parentSpan.updateName(name);\n                    }\n                } else {\n                    span.updateName(`${method} ${srcPage}`);\n                }\n            });\n        // TODO: activeSpan code path is for when wrapped by\n        // next-server can be removed when this is no longer used\n        if (isWrappedByNextServer && activeSpan) {\n            await invokeRouteModule(activeSpan);\n        } else {\n            parentSpan = tracer.getActiveScopeSpan();\n            await tracer.withPropagatedContext(req.headers, ()=>tracer.trace(next_dist_server_lib_trace_constants__WEBPACK_IMPORTED_MODULE_6__.BaseServerSpan.handleRequest, {\n                    spanName: `${method} ${srcPage}`,\n                    kind: next_dist_server_lib_trace_tracer__WEBPACK_IMPORTED_MODULE_5__.SpanKind.SERVER,\n                    attributes: {\n                        'http.method': method,\n                        'http.target': req.url\n                    }\n                }, invokeRouteModule), undefined, !isWrappedByNextServer);\n        }\n    } catch (err) {\n        // we re-throw in dev to show the error overlay\n        if (routeModule.isDev) {\n            throw err;\n        }\n        // this is technically an invariant as error handling\n        // should be done inside of api-resolver onError\n        (0,next_dist_server_api_utils__WEBPACK_IMPORTED_MODULE_0__.sendError)(res, 500, 'Internal Server Error');\n    } finally{\n        // We don't allow any waitUntil work in pages API routes currently\n        // so if callback is present return with resolved promise since no\n        // pending work\n        ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, Promise.resolve());\n    }\n}\n\n//# sourceMappingURL=pages-api.js.map\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaS1ub2RlKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYnVpbGQvd2VicGFjay9sb2FkZXJzL25leHQtcm91dGUtbG9hZGVyL2luZGV4LmpzP2tpbmQ9UEFHRVNfQVBJJnBhZ2U9JTJGYXBpJTJGcGVucm9zZS1yZW5kZXImcHJlZmVycmVkUmVnaW9uPSZhYnNvbHV0ZVBhZ2VQYXRoPS4lMkZwYWdlcyUyRmFwaSUyRnBlbnJvc2UtcmVuZGVyLmpzJm1pZGRsZXdhcmVDb25maWdCYXNlNjQ9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXVEO0FBQ0M7QUFDdUM7QUFDckM7QUFDMUQ7QUFDMEQ7QUFDYztBQUNGO0FBQ1M7QUFDL0U7QUFDQSxpRUFBZSx3RUFBSyxDQUFDLHlEQUFRLFlBQVksRUFBQztBQUMxQztBQUNPLGVBQWUsd0VBQUssQ0FBQyx5REFBUTtBQUNwQztBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsWUFBWTtBQUNaLGFBQWEsV0FBb0MsSUFBSSxDQUFFO0FBQ3ZELHdCQUF3QixNQUF1QztBQUMvRCxDQUFDO0FBQ007QUFDUDtBQUNBLFFBQVEsNkVBQWM7QUFDdEI7QUFDQTtBQUNBLFFBQVEsNkVBQWM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsS0FBcUIsRUFBRSxFQUUxQjtBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSx3REFBd0Q7QUFDcEU7QUFDQTtBQUNBLHVCQUF1Qiw0RUFBUztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsNkNBQTZDLEVBQTZDO0FBQzFGLDRDQUE0QyxLQUF3QztBQUNwRixpQ0FBaUMsS0FBb0M7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWlFLGdGQUFjO0FBQy9FLCtEQUErRCx5Q0FBeUM7QUFDeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsUUFBUSxFQUFFLE1BQU07QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEIsdUNBQXVDLFFBQVEsRUFBRSxRQUFRO0FBQ3pEO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsNkVBQTZFLGdGQUFjO0FBQzNGLGlDQUFpQyxRQUFRLEVBQUUsUUFBUTtBQUNuRCwwQkFBMEIsdUVBQVE7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxxRUFBUztBQUNqQixNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2VuZEVycm9yIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvYXBpLXV0aWxzXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBQYWdlc0FQSVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9wYWdlcy1hcGkvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBob2lzdCB9IGZyb20gXCJuZXh0L2Rpc3QvYnVpbGQvdGVtcGxhdGVzL2hlbHBlcnNcIjtcbi8vIEltcG9ydCB0aGUgdXNlcmxhbmQgY29kZS5cbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIuL3BhZ2VzL2FwaS9wZW5yb3NlLXJlbmRlci5qc1wiO1xuaW1wb3J0IHsgZ2V0VHJhY2VyLCBTcGFuS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi90cmFjZS90cmFjZXJcIjtcbmltcG9ydCB7IEJhc2VTZXJ2ZXJTcGFuIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3RyYWNlL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgYWRkUmVxdWVzdE1ldGEsIHNldFJlcXVlc3RNZXRhIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcmVxdWVzdC1tZXRhXCI7XG4vLyBSZS1leHBvcnQgdGhlIGhhbmRsZXIgKHNob3VsZCBiZSB0aGUgZGVmYXVsdCBleHBvcnQpLlxuZXhwb3J0IGRlZmF1bHQgaG9pc3QodXNlcmxhbmQsICdkZWZhdWx0Jyk7XG4vLyBSZS1leHBvcnQgY29uZmlnLlxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IGhvaXN0KHVzZXJsYW5kLCAnY29uZmlnJyk7XG4vLyBDcmVhdGUgYW5kIGV4cG9ydCB0aGUgcm91dGUgbW9kdWxlIHRoYXQgd2lsbCBiZSBjb25zdW1lZC5cbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IFBhZ2VzQVBJUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLlBBR0VTX0FQSSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3BlbnJvc2UtcmVuZGVyXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvcGVucm9zZS1yZW5kZXJcIixcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBhcmVuJ3QgdXNlZCBpbiBwcm9kdWN0aW9uLlxuICAgICAgICBidW5kbGVQYXRoOiAnJyxcbiAgICAgICAgZmlsZW5hbWU6ICcnXG4gICAgfSxcbiAgICB1c2VybGFuZCxcbiAgICBkaXN0RGlyOiBwcm9jZXNzLmVudi5fX05FWFRfUkVMQVRJVkVfRElTVF9ESVIgfHwgJycsXG4gICAgcmVsYXRpdmVQcm9qZWN0RGlyOiBwcm9jZXNzLmVudi5fX05FWFRfUkVMQVRJVkVfUFJPSkVDVF9ESVIgfHwgJydcbn0pO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMsIGN0eCkge1xuICAgIGlmIChjdHgucmVxdWVzdE1ldGEpIHtcbiAgICAgICAgc2V0UmVxdWVzdE1ldGEocmVxLCBjdHgucmVxdWVzdE1ldGEpO1xuICAgIH1cbiAgICBpZiAocm91dGVNb2R1bGUuaXNEZXYpIHtcbiAgICAgICAgYWRkUmVxdWVzdE1ldGEocmVxLCAnZGV2UmVxdWVzdFRpbWluZ0ludGVybmFsc0VuZCcsIHByb2Nlc3MuaHJ0aW1lLmJpZ2ludCgpKTtcbiAgICB9XG4gICAgbGV0IHNyY1BhZ2UgPSBcIi9hcGkvcGVucm9zZS1yZW5kZXJcIjtcbiAgICAvLyB0dXJib3BhY2sgZG9lc24ndCBub3JtYWxpemUgYC9pbmRleGAgaW4gdGhlIHBhZ2UgbmFtZVxuICAgIC8vIHNvIHdlIG5lZWQgdG8gdG8gcHJvY2VzcyBkeW5hbWljIHJvdXRlcyBwcm9wZXJseVxuICAgIC8vIFRPRE86IGZpeCB0dXJib3BhY2sgcHJvdmlkaW5nIGRpZmZlcmluZyB2YWx1ZSBmcm9tIHdlYnBhY2tcbiAgICBpZiAocHJvY2Vzcy5lbnYuVFVSQk9QQUNLKSB7XG4gICAgICAgIHNyY1BhZ2UgPSBzcmNQYWdlLnJlcGxhY2UoL1xcL2luZGV4JC8sICcnKSB8fCAnLyc7XG4gICAgfVxuICAgIGNvbnN0IHByZXBhcmVSZXN1bHQgPSBhd2FpdCByb3V0ZU1vZHVsZS5wcmVwYXJlKHJlcSwgcmVzLCB7XG4gICAgICAgIHNyY1BhZ2VcbiAgICB9KTtcbiAgICBpZiAoIXByZXBhcmVSZXN1bHQpIHtcbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XG4gICAgICAgIHJlcy5lbmQoJ0JhZCBSZXF1ZXN0Jyk7XG4gICAgICAgIGN0eC53YWl0VW50aWwgPT0gbnVsbCA/IHZvaWQgMCA6IGN0eC53YWl0VW50aWwuY2FsbChjdHgsIFByb21pc2UucmVzb2x2ZSgpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7IHF1ZXJ5LCBwYXJhbXMsIHByZXJlbmRlck1hbmlmZXN0LCByb3V0ZXJTZXJ2ZXJDb250ZXh0IH0gPSBwcmVwYXJlUmVzdWx0O1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1ldGhvZCA9IHJlcS5tZXRob2QgfHwgJ0dFVCc7XG4gICAgICAgIGNvbnN0IHRyYWNlciA9IGdldFRyYWNlcigpO1xuICAgICAgICBjb25zdCBhY3RpdmVTcGFuID0gdHJhY2VyLmdldEFjdGl2ZVNjb3BlU3BhbigpO1xuICAgICAgICBjb25zdCBpc1dyYXBwZWRCeU5leHRTZXJ2ZXIgPSBCb29sZWFuKHJvdXRlclNlcnZlckNvbnRleHQgPT0gbnVsbCA/IHZvaWQgMCA6IHJvdXRlclNlcnZlckNvbnRleHQuaXNXcmFwcGVkQnlOZXh0U2VydmVyKTtcbiAgICAgICAgY29uc3Qgb25SZXF1ZXN0RXJyb3IgPSByb3V0ZU1vZHVsZS5pbnN0cnVtZW50YXRpb25PblJlcXVlc3RFcnJvci5iaW5kKHJvdXRlTW9kdWxlKTtcbiAgICAgICAgbGV0IHBhcmVudFNwYW47XG4gICAgICAgIGNvbnN0IGludm9rZVJvdXRlTW9kdWxlID0gYXN5bmMgKHNwYW4pPT5yb3V0ZU1vZHVsZS5yZW5kZXIocmVxLCByZXMsIHtcbiAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAuLi5xdWVyeSxcbiAgICAgICAgICAgICAgICAgICAgLi4ucGFyYW1zXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICAgICAgYWxsb3dlZFJldmFsaWRhdGVIZWFkZXJLZXlzOiBwcm9jZXNzLmVudi5fX05FWFRfQUxMT1dFRF9SRVZBTElEQVRFX0hFQURFUlMsXG4gICAgICAgICAgICAgICAgbXVsdGlab25lRHJhZnRNb2RlOiBCb29sZWFuKHByb2Nlc3MuZW52Ll9fTkVYVF9NVUxUSV9aT05FX0RSQUZUX01PREUpLFxuICAgICAgICAgICAgICAgIHRydXN0SG9zdEhlYWRlcjogcHJvY2Vzcy5lbnYuX19ORVhUX1RSVVNUX0hPU1RfSEVBREVSLFxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGdldCB0aGlzIGZyb20gZnJvbSBydW50aW1lIGVudiBzbyBtYW5pZmVzdFxuICAgICAgICAgICAgICAgIC8vIGRvZXNuJ3QgbmVlZCB0byBsb2FkXG4gICAgICAgICAgICAgICAgcHJldmlld1Byb3BzOiBwcmVyZW5kZXJNYW5pZmVzdC5wcmV2aWV3LFxuICAgICAgICAgICAgICAgIHByb3BhZ2F0ZUVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkZXY6IHJvdXRlTW9kdWxlLmlzRGV2LFxuICAgICAgICAgICAgICAgIHBhZ2U6IFwiL2FwaS9wZW5yb3NlLXJlbmRlclwiLFxuICAgICAgICAgICAgICAgIGludGVybmFsUmV2YWxpZGF0ZTogcm91dGVyU2VydmVyQ29udGV4dCA9PSBudWxsID8gdm9pZCAwIDogcm91dGVyU2VydmVyQ29udGV4dC5yZXZhbGlkYXRlLFxuICAgICAgICAgICAgICAgIG9uRXJyb3I6ICguLi5hcmdzKT0+b25SZXF1ZXN0RXJyb3IocmVxLCAuLi5hcmdzKVxuICAgICAgICAgICAgfSkuZmluYWxseSgoKT0+e1xuICAgICAgICAgICAgICAgIGlmICghc3BhbikgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICdodHRwLnN0YXR1c19jb2RlJzogcmVzLnN0YXR1c0NvZGUsXG4gICAgICAgICAgICAgICAgICAgICduZXh0LnJzYyc6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdFNwYW5BdHRyaWJ1dGVzID0gdHJhY2VyLmdldFJvb3RTcGFuQXR0cmlidXRlcygpO1xuICAgICAgICAgICAgICAgIC8vIFdlIHdlcmUgdW5hYmxlIHRvIGdldCBhdHRyaWJ1dGVzLCBwcm9iYWJseSBPVEVMIGlzIG5vdCBlbmFibGVkXG4gICAgICAgICAgICAgICAgaWYgKCFyb290U3BhbkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocm9vdFNwYW5BdHRyaWJ1dGVzLmdldCgnbmV4dC5zcGFuX3R5cGUnKSAhPT0gQmFzZVNlcnZlclNwYW4uaGFuZGxlUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuZXhwZWN0ZWQgcm9vdCBzcGFuIHR5cGUgJyR7cm9vdFNwYW5BdHRyaWJ1dGVzLmdldCgnbmV4dC5zcGFuX3R5cGUnKX0nLiBQbGVhc2UgcmVwb3J0IHRoaXMgTmV4dC5qcyBpc3N1ZSBodHRwczovL2dpdGh1Yi5jb20vdmVyY2VsL25leHQuanNgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByb3V0ZSA9IHJvb3RTcGFuQXR0cmlidXRlcy5nZXQoJ25leHQucm91dGUnKTtcbiAgICAgICAgICAgICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGAke21ldGhvZH0gJHtyb3V0ZX1gO1xuICAgICAgICAgICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ25leHQucm91dGUnOiByb3V0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdodHRwLnJvdXRlJzogcm91dGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbmV4dC5zcGFuX25hbWUnOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzcGFuLnVwZGF0ZU5hbWUobmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFByb3BhZ2F0ZSBodHRwLnJvdXRlIHRvIHRoZSBwYXJlbnQgc3BhbiBpZiBvbmUgZXhpc3RzIChlLmcuXG4gICAgICAgICAgICAgICAgICAgIC8vIGEgcGxhdGZvcm0tY3JlYXRlZCBIVFRQIHNwYW4gaW4gYWRhcHRlciBkZXBsb3ltZW50cykuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRTcGFuICYmIHBhcmVudFNwYW4gIT09IHNwYW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFNwYW4uc2V0QXR0cmlidXRlKCdodHRwLnJvdXRlJywgcm91dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50U3Bhbi51cGRhdGVOYW1lKG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3Bhbi51cGRhdGVOYW1lKGAke21ldGhvZH0gJHtzcmNQYWdlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyBUT0RPOiBhY3RpdmVTcGFuIGNvZGUgcGF0aCBpcyBmb3Igd2hlbiB3cmFwcGVkIGJ5XG4gICAgICAgIC8vIG5leHQtc2VydmVyIGNhbiBiZSByZW1vdmVkIHdoZW4gdGhpcyBpcyBubyBsb25nZXIgdXNlZFxuICAgICAgICBpZiAoaXNXcmFwcGVkQnlOZXh0U2VydmVyICYmIGFjdGl2ZVNwYW4pIHtcbiAgICAgICAgICAgIGF3YWl0IGludm9rZVJvdXRlTW9kdWxlKGFjdGl2ZVNwYW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyZW50U3BhbiA9IHRyYWNlci5nZXRBY3RpdmVTY29wZVNwYW4oKTtcbiAgICAgICAgICAgIGF3YWl0IHRyYWNlci53aXRoUHJvcGFnYXRlZENvbnRleHQocmVxLmhlYWRlcnMsICgpPT50cmFjZXIudHJhY2UoQmFzZVNlcnZlclNwYW4uaGFuZGxlUmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICBzcGFuTmFtZTogYCR7bWV0aG9kfSAke3NyY1BhZ2V9YCxcbiAgICAgICAgICAgICAgICAgICAga2luZDogU3BhbktpbmQuU0VSVkVSLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaHR0cC5tZXRob2QnOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaHR0cC50YXJnZXQnOiByZXEudXJsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBpbnZva2VSb3V0ZU1vZHVsZSksIHVuZGVmaW5lZCwgIWlzV3JhcHBlZEJ5TmV4dFNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gd2UgcmUtdGhyb3cgaW4gZGV2IHRvIHNob3cgdGhlIGVycm9yIG92ZXJsYXlcbiAgICAgICAgaWYgKHJvdXRlTW9kdWxlLmlzRGV2KSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhpcyBpcyB0ZWNobmljYWxseSBhbiBpbnZhcmlhbnQgYXMgZXJyb3IgaGFuZGxpbmdcbiAgICAgICAgLy8gc2hvdWxkIGJlIGRvbmUgaW5zaWRlIG9mIGFwaS1yZXNvbHZlciBvbkVycm9yXG4gICAgICAgIHNlbmRFcnJvcihyZXMsIDUwMCwgJ0ludGVybmFsIFNlcnZlciBFcnJvcicpO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgLy8gV2UgZG9uJ3QgYWxsb3cgYW55IHdhaXRVbnRpbCB3b3JrIGluIHBhZ2VzIEFQSSByb3V0ZXMgY3VycmVudGx5XG4gICAgICAgIC8vIHNvIGlmIGNhbGxiYWNrIGlzIHByZXNlbnQgcmV0dXJuIHdpdGggcmVzb2x2ZWQgcHJvbWlzZSBzaW5jZSBub1xuICAgICAgICAvLyBwZW5kaW5nIHdvcmtcbiAgICAgICAgY3R4LndhaXRVbnRpbCA9PSBudWxsID8gdm9pZCAwIDogY3R4LndhaXRVbnRpbC5jYWxsKGN0eCwgUHJvbWlzZS5yZXNvbHZlKCkpO1xuICAgIH1cbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFnZXMtYXBpLmpzLm1hcFxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fpenrose-render&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fpenrose-render.js&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api-node)/./pages/api/penrose-render.js":
/*!*************************************!*\
  !*** ./pages/api/penrose-render.js ***!
  \*************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var global_jsdom_register__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! global-jsdom/register */ \"global-jsdom/register\");\n/* harmony import */ var _penrose_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @penrose/core */ \"(api-node)/./node_modules/@penrose/core/dist/index.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([global_jsdom_register__WEBPACK_IMPORTED_MODULE_0__, _penrose_core__WEBPACK_IMPORTED_MODULE_1__]);\n([global_jsdom_register__WEBPACK_IMPORTED_MODULE_0__, _penrose_core__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n// Server-side Penrose rendering — avoids all browser bundler/WASM/TLA issues.\n// Penrose is designed for browser DOM but global-jsdom stubs what it needs in Node.\n\n\nasync function handler(req, res) {\n    if (req.method !== \"POST\") {\n        return res.status(405).json({\n            error: \"POST only\"\n        });\n    }\n    const { domain, substance, style, variation = \"abc123\" } = req.body ?? {};\n    if (!domain || !substance || !style) {\n        return res.status(400).json({\n            error: \"domain, substance, style required\"\n        });\n    }\n    try {\n        const compiled = await (0,_penrose_core__WEBPACK_IMPORTED_MODULE_1__.compile)({\n            domain,\n            substance,\n            style,\n            variation\n        });\n        if (compiled.isErr()) {\n            return res.status(422).json({\n                error: (0,_penrose_core__WEBPACK_IMPORTED_MODULE_1__.showError)(compiled.error)\n            });\n        }\n        const optimized = (0,_penrose_core__WEBPACK_IMPORTED_MODULE_1__.optimize)(compiled.value);\n        if (optimized.isErr()) {\n            return res.status(422).json({\n                error: (0,_penrose_core__WEBPACK_IMPORTED_MODULE_1__.showError)(optimized.error)\n            });\n        }\n        const svgEl = await (0,_penrose_core__WEBPACK_IMPORTED_MODULE_1__.toSVG)(optimized.value, async ()=>undefined, \"penrose\");\n        const rawSvg = typeof svgEl === \"string\" ? svgEl : svgEl.outerHTML;\n        // Penrose serializes each color channel as Math.round(c_8bit * 255) in hex,\n        // WITHOUT zero-padding. Channels 0–16 (value ≤ 4080) produce only 1–3 hex\n        // digits instead of 4, yielding 5–11 char hex strings that browsers reject.\n        //\n        // Recovery: all valid channel values are multiples of 255 in [0, 65025].\n        // We try all (len1, len2, len3) splits where each len is 1–4, find the\n        // unique one where every group divided by 255 is an integer ≤ 255, and\n        // decode as c_8bit = hex_group / 255.\n        //\n        // ORDER: run 5–11 char pass FIRST so its 6-char outputs are not re-consumed\n        // by the 12-char pass (which requires exactly {4}{4}{4} = 12 hex chars).\n        function normalizePenroseHex(svg) {\n            function tryConvert(hex) {\n                const n = hex.length;\n                for(let l1 = 1; l1 <= 4; l1++){\n                    for(let l2 = 1; l2 <= 4; l2++){\n                        const l3 = n - l1 - l2;\n                        if (l3 < 1 || l3 > 4) continue;\n                        const rv = parseInt(hex.slice(0, l1).padStart(4, \"0\"), 16);\n                        const gv = parseInt(hex.slice(l1, l1 + l2).padStart(4, \"0\"), 16);\n                        const bv = parseInt(hex.slice(l1 + l2).padStart(4, \"0\"), 16);\n                        if (rv % 255 === 0 && gv % 255 === 0 && bv % 255 === 0 && rv <= 65025 && gv <= 65025 && bv <= 65025) {\n                            return \"#\" + [\n                                rv,\n                                gv,\n                                bv\n                            ].map((v)=>Math.round(v / 255).toString(16).padStart(2, \"0\")).join(\"\");\n                        }\n                    }\n                }\n                return null;\n            }\n            return svg// Pass 1: 5–11 char hex (≥1 channel dropped a leading zero)\n            .replace(/#([0-9a-fA-F]{5,11})(?![0-9a-fA-F])/g, (match, hex)=>tryConvert(hex) ?? match)// Pass 2: 12-char hex (all 3 channels produced 4 digits — common case)\n            .replace(/#([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})(?![0-9a-fA-F])/g, (_, r, g, b)=>\"#\" + [\n                    r,\n                    g,\n                    b\n                ].map((h)=>Math.round(parseInt(h, 16) / 255).toString(16).padStart(2, \"0\")).join(\"\"));\n        }\n        const svg = normalizePenroseHex(rawSvg);\n        res.setHeader(\"Content-Type\", \"application/json\");\n        return res.status(200).json({\n            svg\n        });\n    } catch (err) {\n        return res.status(500).json({\n            error: err?.message ?? String(err)\n        });\n    }\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VDtZQUNBLE9BQU9uQixHQUNMLDREQUE0RDthQUMzRG9CLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQ0MsT0FBT25CLE1BQ3ZERCxXQUFXQyxRQUFRbUIsTUFFckIsdUVBQXVFO2FBQ3RFRCxPQUFPLENBQ04scUVBQ0EsQ0FBQ0UsR0FBR0MsR0FBR0MsR0FBR0MsSUFDUixNQUFNO29CQUFDRjtvQkFBR0M7b0JBQUdDO2lCQUFFLENBQUNYLEdBQUcsQ0FBQ1ksQ0FBQUEsSUFDbEJWLEtBQUtDLEtBQUssQ0FBQ1IsU0FBU2lCLEdBQUcsTUFBTSxLQUFLUixRQUFRLENBQUMsSUFBSVAsUUFBUSxDQUFDLEdBQUcsTUFDM0RRLElBQUksQ0FBQztRQUVmO1FBRUEsTUFBTW5CLE1BQU1ELG9CQUFvQkY7UUFFaENoQixJQUFJOEMsU0FBUyxDQUFDLGdCQUFnQjtRQUM5QixPQUFPOUMsSUFBSUUsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztZQUFFZ0I7UUFBSTtJQUNwQyxFQUFFLE9BQU80QixLQUFLO1FBQ1osT0FBTy9DLElBQUlFLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsT0FBTzJDLEtBQUtDLFdBQVdDLE9BQU9GO1FBQUs7SUFDbkU7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL2xpbmNvbG4vU09MX1YwL2Zyb250ZW5kL3BhZ2VzL2FwaS9wZW5yb3NlLXJlbmRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTZXJ2ZXItc2lkZSBQZW5yb3NlIHJlbmRlcmluZyDigJQgYXZvaWRzIGFsbCBicm93c2VyIGJ1bmRsZXIvV0FTTS9UTEEgaXNzdWVzLlxuLy8gUGVucm9zZSBpcyBkZXNpZ25lZCBmb3IgYnJvd3NlciBET00gYnV0IGdsb2JhbC1qc2RvbSBzdHVicyB3aGF0IGl0IG5lZWRzIGluIE5vZGUuXG5pbXBvcnQgXCJnbG9iYWwtanNkb20vcmVnaXN0ZXJcIjtcbmltcG9ydCB7IGNvbXBpbGUsIG9wdGltaXplLCB0b1NWRywgc2hvd0Vycm9yIH0gZnJvbSBcIkBwZW5yb3NlL2NvcmVcIjtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICBpZiAocmVxLm1ldGhvZCAhPT0gXCJQT1NUXCIpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDUpLmpzb24oeyBlcnJvcjogXCJQT1NUIG9ubHlcIiB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgZG9tYWluLCBzdWJzdGFuY2UsIHN0eWxlLCB2YXJpYXRpb24gPSBcImFiYzEyM1wiIH0gPSByZXEuYm9keSA/PyB7fTtcbiAgaWYgKCFkb21haW4gfHwgIXN1YnN0YW5jZSB8fCAhc3R5bGUpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJkb21haW4sIHN1YnN0YW5jZSwgc3R5bGUgcmVxdWlyZWRcIiB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgY29tcGlsZWQgPSBhd2FpdCBjb21waWxlKHsgZG9tYWluLCBzdWJzdGFuY2UsIHN0eWxlLCB2YXJpYXRpb24gfSk7XG4gICAgaWYgKGNvbXBpbGVkLmlzRXJyKCkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQyMikuanNvbih7IGVycm9yOiBzaG93RXJyb3IoY29tcGlsZWQuZXJyb3IpIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZCA9IG9wdGltaXplKGNvbXBpbGVkLnZhbHVlKTtcbiAgICBpZiAob3B0aW1pemVkLmlzRXJyKCkpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQyMikuanNvbih7IGVycm9yOiBzaG93RXJyb3Iob3B0aW1pemVkLmVycm9yKSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdmdFbCA9IGF3YWl0IHRvU1ZHKG9wdGltaXplZC52YWx1ZSwgYXN5bmMgKCkgPT4gdW5kZWZpbmVkLCBcInBlbnJvc2VcIik7XG4gICAgY29uc3QgcmF3U3ZnID0gdHlwZW9mIHN2Z0VsID09PSBcInN0cmluZ1wiID8gc3ZnRWwgOiBzdmdFbC5vdXRlckhUTUw7XG5cbiAgICAvLyBQZW5yb3NlIHNlcmlhbGl6ZXMgZWFjaCBjb2xvciBjaGFubmVsIGFzIE1hdGgucm91bmQoY184Yml0ICogMjU1KSBpbiBoZXgsXG4gICAgLy8gV0lUSE9VVCB6ZXJvLXBhZGRpbmcuIENoYW5uZWxzIDDigJMxNiAodmFsdWUg4omkIDQwODApIHByb2R1Y2Ugb25seSAx4oCTMyBoZXhcbiAgICAvLyBkaWdpdHMgaW5zdGVhZCBvZiA0LCB5aWVsZGluZyA14oCTMTEgY2hhciBoZXggc3RyaW5ncyB0aGF0IGJyb3dzZXJzIHJlamVjdC5cbiAgICAvL1xuICAgIC8vIFJlY292ZXJ5OiBhbGwgdmFsaWQgY2hhbm5lbCB2YWx1ZXMgYXJlIG11bHRpcGxlcyBvZiAyNTUgaW4gWzAsIDY1MDI1XS5cbiAgICAvLyBXZSB0cnkgYWxsIChsZW4xLCBsZW4yLCBsZW4zKSBzcGxpdHMgd2hlcmUgZWFjaCBsZW4gaXMgMeKAkzQsIGZpbmQgdGhlXG4gICAgLy8gdW5pcXVlIG9uZSB3aGVyZSBldmVyeSBncm91cCBkaXZpZGVkIGJ5IDI1NSBpcyBhbiBpbnRlZ2VyIOKJpCAyNTUsIGFuZFxuICAgIC8vIGRlY29kZSBhcyBjXzhiaXQgPSBoZXhfZ3JvdXAgLyAyNTUuXG4gICAgLy9cbiAgICAvLyBPUkRFUjogcnVuIDXigJMxMSBjaGFyIHBhc3MgRklSU1Qgc28gaXRzIDYtY2hhciBvdXRwdXRzIGFyZSBub3QgcmUtY29uc3VtZWRcbiAgICAvLyBieSB0aGUgMTItY2hhciBwYXNzICh3aGljaCByZXF1aXJlcyBleGFjdGx5IHs0fXs0fXs0fSA9IDEyIGhleCBjaGFycykuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplUGVucm9zZUhleChzdmcpIHtcbiAgICAgIGZ1bmN0aW9uIHRyeUNvbnZlcnQoaGV4KSB7XG4gICAgICAgIGNvbnN0IG4gPSBoZXgubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBsMSA9IDE7IGwxIDw9IDQ7IGwxKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBsMiA9IDE7IGwyIDw9IDQ7IGwyKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGwzID0gbiAtIGwxIC0gbDI7XG4gICAgICAgICAgICBpZiAobDMgPCAxIHx8IGwzID4gNCkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBydiA9IHBhcnNlSW50KGhleC5zbGljZSgwLCBsMSkucGFkU3RhcnQoNCwgXCIwXCIpLCAxNik7XG4gICAgICAgICAgICBjb25zdCBndiA9IHBhcnNlSW50KGhleC5zbGljZShsMSwgbDEgKyBsMikucGFkU3RhcnQoNCwgXCIwXCIpLCAxNik7XG4gICAgICAgICAgICBjb25zdCBidiA9IHBhcnNlSW50KGhleC5zbGljZShsMSArIGwyKS5wYWRTdGFydCg0LCBcIjBcIiksIDE2KTtcbiAgICAgICAgICAgIGlmIChydiAlIDI1NSA9PT0gMCAmJiBndiAlIDI1NSA9PT0gMCAmJiBidiAlIDI1NSA9PT0gMFxuICAgICAgICAgICAgICAgICYmIHJ2IDw9IDY1MDI1ICYmIGd2IDw9IDY1MDI1ICYmIGJ2IDw9IDY1MDI1KSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIiNcIiArIFtydiwgZ3YsIGJ2XS5tYXAodiA9PlxuICAgICAgICAgICAgICAgIE1hdGgucm91bmQodiAvIDI1NSkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKVxuICAgICAgICAgICAgICApLmpvaW4oXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN2Z1xuICAgICAgICAvLyBQYXNzIDE6IDXigJMxMSBjaGFyIGhleCAo4omlMSBjaGFubmVsIGRyb3BwZWQgYSBsZWFkaW5nIHplcm8pXG4gICAgICAgIC5yZXBsYWNlKC8jKFswLTlhLWZBLUZdezUsMTF9KSg/IVswLTlhLWZBLUZdKS9nLCAobWF0Y2gsIGhleCkgPT5cbiAgICAgICAgICB0cnlDb252ZXJ0KGhleCkgPz8gbWF0Y2hcbiAgICAgICAgKVxuICAgICAgICAvLyBQYXNzIDI6IDEyLWNoYXIgaGV4IChhbGwgMyBjaGFubmVscyBwcm9kdWNlZCA0IGRpZ2l0cyDigJQgY29tbW9uIGNhc2UpXG4gICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgIC8jKFswLTlhLWZBLUZdezR9KShbMC05YS1mQS1GXXs0fSkoWzAtOWEtZkEtRl17NH0pKD8hWzAtOWEtZkEtRl0pL2csXG4gICAgICAgICAgKF8sIHIsIGcsIGIpID0+XG4gICAgICAgICAgICBcIiNcIiArIFtyLCBnLCBiXS5tYXAoaCA9PlxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKHBhcnNlSW50KGgsIDE2KSAvIDI1NSkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKVxuICAgICAgICAgICAgKS5qb2luKFwiXCIpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3ZnID0gbm9ybWFsaXplUGVucm9zZUhleChyYXdTdmcpO1xuXG4gICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3ZnIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogZXJyPy5tZXNzYWdlID8/IFN0cmluZyhlcnIpIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOlsiY29tcGlsZSIsIm9wdGltaXplIiwidG9TVkciLCJzaG93RXJyb3IiLCJoYW5kbGVyIiwicmVxIiwicmVzIiwibWV0aG9kIiwic3RhdHVzIiwianNvbiIsImVycm9yIiwiZG9tYWluIiwic3Vic3RhbmNlIiwic3R5bGUiLCJ2YXJpYXRpb24iLCJib2R5IiwiY29tcGlsZWQiLCJpc0VyciIsIm9wdGltaXplZCIsInZhbHVlIiwic3ZnRWwiLCJ1bmRlZmluZWQiLCJyYXdTdmciLCJvdXRlckhUTUwiLCJub3JtYWxpemVQZW5yb3NlSGV4Iiwic3ZnIiwidHJ5Q29udmVydCIsImhleCIsIm4iLCJsZW5ndGgiLCJsMSIsImwyIiwibDMiLCJydiIsInBhcnNlSW50Iiwic2xpY2UiLCJwYWRTdGFydCIsImd2IiwiYnYiLCJtYXAiLCJ2IiwiTWF0aCIsInJvdW5kIiwidG9TdHJpbmciLCJqb2luIiwicmVwbGFjZSIsIm1hdGNoIiwiXyIsInIiLCJnIiwiYiIsImgiLCJzZXRIZWFkZXIiLCJlcnIiLCJtZXNzYWdlIiwiU3RyaW5nIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api-node)/./pages/api/penrose-render.js\n");

/***/ }),

/***/ "@opentelemetry/api":
/*!*************************************!*\
  !*** external "@opentelemetry/api" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("@opentelemetry/api");

/***/ }),

/***/ "consola":
/*!**************************!*\
  !*** external "consola" ***!
  \**************************/
/***/ ((module) => {

module.exports = import("consola");;

/***/ }),

/***/ "global-jsdom/register":
/*!****************************************!*\
  !*** external "global-jsdom/register" ***!
  \****************************************/
/***/ ((module) => {

module.exports = import("global-jsdom/register");;

/***/ }),

/***/ "immutable":
/*!****************************!*\
  !*** external "immutable" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("immutable");

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("lodash");

/***/ }),

/***/ "mathjax-full/js/adaptors/browserAdaptor.js":
/*!*************************************************************!*\
  !*** external "mathjax-full/js/adaptors/browserAdaptor.js" ***!
  \*************************************************************/
/***/ ((module) => {

module.exports = require("mathjax-full/js/adaptors/browserAdaptor.js");

/***/ }),

/***/ "mathjax-full/js/handlers/html.js":
/*!***************************************************!*\
  !*** external "mathjax-full/js/handlers/html.js" ***!
  \***************************************************/
/***/ ((module) => {

module.exports = require("mathjax-full/js/handlers/html.js");

/***/ }),

/***/ "mathjax-full/js/input/tex.js":
/*!***********************************************!*\
  !*** external "mathjax-full/js/input/tex.js" ***!
  \***********************************************/
/***/ ((module) => {

module.exports = require("mathjax-full/js/input/tex.js");

/***/ }),

/***/ "mathjax-full/js/input/tex/AllPackages.js":
/*!***********************************************************!*\
  !*** external "mathjax-full/js/input/tex/AllPackages.js" ***!
  \***********************************************************/
/***/ ((module) => {

module.exports = require("mathjax-full/js/input/tex/AllPackages.js");

/***/ }),

/***/ "mathjax-full/js/mathjax.js":
/*!*********************************************!*\
  !*** external "mathjax-full/js/mathjax.js" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = require("mathjax-full/js/mathjax.js");

/***/ }),

/***/ "mathjax-full/js/output/svg.js":
/*!************************************************!*\
  !*** external "mathjax-full/js/output/svg.js" ***!
  \************************************************/
/***/ ((module) => {

module.exports = require("mathjax-full/js/output/svg.js");

/***/ }),

/***/ "ml-matrix":
/*!****************************!*\
  !*** external "ml-matrix" ***!
  \****************************/
/***/ ((module) => {

module.exports = import("ml-matrix");;

/***/ }),

/***/ "moo":
/*!**********************!*\
  !*** external "moo" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("moo");

/***/ }),

/***/ "nearley":
/*!**************************!*\
  !*** external "nearley" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("nearley");

/***/ }),

/***/ "next/dist/compiled/next-server/pages-api.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages-api.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages-api.runtime.dev.js");

/***/ }),

/***/ "poly-partition":
/*!*********************************!*\
  !*** external "poly-partition" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("poly-partition");

/***/ }),

/***/ "rose":
/*!***********************!*\
  !*** external "rose" ***!
  \***********************/
/***/ ((module) => {

module.exports = import("rose");;

/***/ }),

/***/ "seedrandom":
/*!*****************************!*\
  !*** external "seedrandom" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("seedrandom");

/***/ }),

/***/ "true-myth":
/*!****************************!*\
  !*** external "true-myth" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("true-myth");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@penrose"], () => (__webpack_exec__("(api-node)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fpenrose-render&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fpenrose-render.js&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();