module.exports = [
"[externals]/fs/promises [external] (fs/promises, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_fs_promises_0bfe4114._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/fs/promises [external] (fs/promises, cjs)");
    });
});
}),
"[project]/lib/file-db.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/lib/file-db.ts [app-route] (ecmascript)");
    });
});
}),
];