module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/lib/project-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProjectProvider",
    ()=>ProjectProvider,
    "useProjects",
    ()=>useProjects
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ProjectContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ProjectProvider({ children }) {
    const [selectedProjectId, setSelectedProjectId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [projects, setProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const load = async ()=>{
            try {
                const res = await fetch("/api/projects");
                if (res.ok) {
                    const items = await res.json();
                    if (Array.isArray(items)) {
                        const normalized = items.map((p)=>{
                            const d = p.createdAt ? new Date(p.createdAt) : null;
                            const y = d ? d.getFullYear() : "";
                            const m = d ? String(d.getMonth() + 1).padStart(2, "0") : "";
                            const day = d ? String(d.getDate()).padStart(2, "0") : "";
                            const h = d ? String(d.getHours()).padStart(2, "0") : "";
                            const min = d ? String(d.getMinutes()).padStart(2, "0") : "";
                            return {
                                ...p,
                                bids: typeof p.bidsCount === "number" ? p.bidsCount : Number(p.bidsCount || p.bids || 0),
                                budget: p.budget != null ? String(p.budget) : "",
                                createdAt: d ? `${y}-${m}-${day} ${h}:${min}` : "",
                                acceptedBidDays: typeof p.acceptedBidDays === "number" ? p.acceptedBidDays : p.acceptedBidDays != null ? Number(p.acceptedBidDays) : undefined
                            };
                        });
                        setProjects(normalized);
                    }
                }
            } catch  {} finally{
                setIsLoaded(true);
            }
        };
        void load();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
    // no-op: keep state in memory; source of truth is Prisma via /api/projects
    }, [
        projects
    ]);
    const addProject = async (project)=>{
        try {
            const token = ("TURBOPACK compile-time value", "undefined") !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("auth_token") || localStorage.getItem("managerToken") || "") || "";
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : {}
                },
                body: JSON.stringify(project)
            });
            if (res.ok) {
                const created = await res.json();
                setProjects((prev)=>[
                        created,
                        ...prev
                    ]);
                try {
                    const listRes = await fetch("/api/projects");
                    if (listRes.ok) {
                        const items = await listRes.json();
                        if (Array.isArray(items)) {
                            const normalized = items.map((p)=>{
                                const d = p.createdAt ? new Date(p.createdAt) : null;
                                const y = d ? d.getFullYear() : "";
                                const m = d ? String(d.getMonth() + 1).padStart(2, "0") : "";
                                const day = d ? String(d.getDate()).padStart(2, "0") : "";
                                const h = d ? String(d.getHours()).padStart(2, "0") : "";
                                const min = d ? String(d.getMinutes()).padStart(2, "0") : "";
                                return {
                                    ...p,
                                    bids: typeof p.bidsCount === "number" ? p.bidsCount : Number(p.bidsCount || p.bids || 0),
                                    budget: p.budget != null ? String(p.budget) : "",
                                    createdAt: d ? `${y}-${m}-${day} ${h}:${min}` : "",
                                    acceptedBidDays: typeof p.acceptedBidDays === "number" ? p.acceptedBidDays : p.acceptedBidDays != null ? Number(p.acceptedBidDays) : undefined
                                };
                            });
                            setProjects(normalized);
                        }
                    }
                } catch  {}
                return {
                    ok: true
                };
            } else {
                let err = "Failed to create project";
                try {
                    const j = await res.json();
                    if (j?.error) err = String(j.error);
                } catch  {}
                return {
                    ok: false,
                    error: err
                };
            }
        } catch  {}
        try {
            const msg = await (async ()=>{
                const r = await fetch("/api/projects");
                return r.ok ? "Server reachable" : "Server unreachable";
            })();
            return {
                ok: false,
                error: msg
            };
        } catch  {
            return {
                ok: false,
                error: "Network error"
            };
        }
    };
    const getProject = (id)=>{
        const foundById = projects.find((p)=>String(p.id) === String(id));
        if (foundById) return foundById;
        const key = String(id).toLowerCase();
        return projects.find((p)=>p.title?.toLowerCase() === key);
    };
    const closeBidding = async (id)=>{
        let updatedRemote = null;
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: "Closed"
                })
            });
            if (res.ok) {
                updatedRemote = await res.json();
            }
        } catch  {}
        setProjects((prev)=>prev.map((p)=>{
                if (String(p.id) !== String(id)) return p;
                if (updatedRemote) {
                    const d = updatedRemote.createdAt ? new Date(updatedRemote.createdAt) : null;
                    let createdAt = p.createdAt;
                    if (d) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        const h = String(d.getHours()).padStart(2, "0");
                        const min = String(d.getMinutes()).padStart(2, "0");
                        createdAt = `${y}-${m}-${day} ${h}:${min}`;
                    }
                    return {
                        ...p,
                        status: String(updatedRemote.status || "Closed"),
                        budget: updatedRemote.budget != null ? String(updatedRemote.budget) : p.budget,
                        createdAt
                    };
                }
                return {
                    ...p,
                    status: p.status === "Awarded" ? "Awarded" : "Closed"
                };
            }));
    };
    const setProjectStatus = async (id, status)=>{
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status
                })
            });
            if (res.ok) {
                try {
                    const latest = await fetch("/api/projects");
                    if (latest.ok) {
                        const items = await latest.json();
                        if (Array.isArray(items)) {
                            const normalized = items.map((p)=>{
                                const d = p.createdAt ? new Date(p.createdAt) : null;
                                const y = d ? d.getFullYear() : "";
                                const m = d ? String(d.getMonth() + 1).padStart(2, "0") : "";
                                const day = d ? String(d.getDate()).padStart(2, "0") : "";
                                const h = d ? String(d.getHours()).padStart(2, "0") : "";
                                const min = d ? String(d.getMinutes()).padStart(2, "0") : "";
                                return {
                                    ...p,
                                    bids: typeof p.bidsCount === "number" ? p.bidsCount : Number(p.bidsCount || p.bids || 0),
                                    budget: p.budget != null ? String(p.budget) : "",
                                    createdAt: d ? `${y}-${m}-${day} ${h}:${min}` : "",
                                    acceptedBidDays: typeof p.acceptedBidDays === "number" ? p.acceptedBidDays : p.acceptedBidDays != null ? Number(p.acceptedBidDays) : undefined
                                };
                            });
                            setProjects(normalized);
                        }
                    }
                } catch  {}
            }
        } catch  {}
        setProjects((prev)=>prev.map((p)=>String(p.id) === String(id) ? {
                    ...p,
                    status
                } : p));
    };
    const incrementBidCount = (id, delta = 1)=>{
        setProjects((prev)=>prev.map((p)=>String(p.id) === String(id) ? {
                    ...p,
                    bids: Math.max(0, (p.bids || 0) + delta)
                } : p));
    };
    const getAllProjects = ()=>projects;
    const getOpenProjects = ()=>projects.filter((p)=>p.status === "Published" || p.status === "Bidding");
    const getProjectsByContractor = (contractorId)=>projects.filter((p)=>p.contractorId === contractorId);
    const getProjectByContractor = (projectId, contractorId)=>projects.find((p)=>String(p.id) === String(projectId) && p.contractorId === contractorId);
    const updateProject = (id, updates)=>{
        let updated;
        setProjects((prev)=>prev.map((p)=>{
                if (String(p.id) === String(id)) {
                    updated = {
                        ...p,
                        ...updates
                    };
                    return updated;
                }
                return p;
            }));
        try {
            fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updates)
            });
        } catch  {}
        return updated;
    };
    const deleteProject = async (id)=>{
        try {
            await fetch(`/api/projects/${id}`, {
                method: "DELETE"
            });
        } catch  {}
        try {
            const latest = await fetch("/api/projects");
            if (latest.ok) {
                const items = await latest.json();
                if (Array.isArray(items)) {
                    const normalized = items.map((p)=>{
                        const d = p.createdAt ? new Date(p.createdAt) : null;
                        const y = d ? d.getFullYear() : "";
                        const m = d ? String(d.getMonth() + 1).padStart(2, "0") : "";
                        const day = d ? String(d.getDate()).padStart(2, "0") : "";
                        const h = d ? String(d.getHours()).padStart(2, "0") : "";
                        const min = d ? String(d.getMinutes()).padStart(2, "0") : "";
                        return {
                            ...p,
                            bids: typeof p.bidsCount === "number" ? p.bidsCount : Number(p.bidsCount || p.bids || 0),
                            budget: p.budget != null ? String(p.budget) : "",
                            createdAt: d ? `${y}-${m}-${day} ${h}:${min}` : "",
                            acceptedBidDays: typeof p.acceptedBidDays === "number" ? p.acceptedBidDays : p.acceptedBidDays != null ? Number(p.acceptedBidDays) : undefined
                        };
                    });
                    setProjects(normalized);
                    return;
                }
            }
        } catch  {}
        setProjects((prev)=>prev.filter((p)=>String(p.id) !== String(id)));
    };
    const decrementBidCount = (id, delta = 1)=>{
        setProjects((prev)=>prev.map((p)=>String(p.id) === String(id) ? {
                    ...p,
                    bids: Math.max(0, (p.bids || 0) - delta)
                } : p));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProjectContext.Provider, {
        value: {
            projects,
            selectedProjectId,
            setSelectedProjectId,
            addProject,
            getProject,
            closeBidding,
            setProjectStatus,
            incrementBidCount,
            isLoaded,
            getAllProjects,
            getOpenProjects,
            getProjectsByContractor,
            getProjectByContractor,
            updateProject,
            deleteProject,
            decrementBidCount
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/project-context.tsx",
        lineNumber: 304,
        columnNumber: 5
    }, this);
}
function useProjects() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ProjectContext);
    if (!context) {
        throw new Error("useProjects must be used within ProjectProvider");
    }
    return context;
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // Load user from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const savedUser = localStorage.getItem("auth_user");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                fetch(`/api/auth/exists?email=${encodeURIComponent(parsedUser.email)}`).then(async (res)=>{
                    if (!res.ok) throw new Error("verify failed");
                    const data = await res.json();
                    if (data?.exists && data.user?.email === parsedUser.email) {
                        setUser(data.user);
                        try {
                            document.cookie = `auth_role=${data.user.role}; Path=/; SameSite=Lax`;
                        } catch  {}
                        console.log("[v0] User verified via Prisma:", parsedUser.email);
                    } else {
                        localStorage.removeItem("auth_user");
                    }
                }).catch(()=>{
                    localStorage.removeItem("auth_user");
                });
            } catch (error) {
                console.error("[v0] Failed to parse saved user:", error);
                localStorage.removeItem("auth_user");
            }
        }
        setIsLoading(false);
    }, []);
    const signUp = async (data)=>{
        setIsLoading(true);
        try {
            console.log("[v0] Signing up user:", data.email);
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                let errorMessage = "Sign up failed";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Sign up failed: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            let userData;
            try {
                userData = await response.json();
            } catch (e) {
                throw new Error("Invalid server response");
            }
            setUser(userData);
            localStorage.setItem("auth_user", JSON.stringify(userData));
            if (userData?.token) {
                try {
                    localStorage.setItem("auth_token", String(userData.token));
                } catch  {}
            }
            try {
                document.cookie = `auth_role=${userData.role}; Path=/; SameSite=Lax`;
            } catch  {}
            const next = userData.role === "vendor" ? "/vendor/portal" : userData.role === "contractor" ? "/contractor/dashboard" : "/manager/dashboard";
            console.log("[v0] Sign up successful, redirecting to:", next);
            router.push(next);
        } catch (err) {
            console.error("[v0] Sign up error:", err);
            throw err;
        } finally{
            setIsLoading(false);
        }
    };
    const signIn = async (email, password)=>{
        setIsLoading(true);
        try {
            console.log("[v0] Signing in user:", email);
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            if (!response.ok) {
                let errorMessage = "Sign in failed";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Sign in failed: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            let userData;
            try {
                userData = await response.json();
            } catch (e) {
                throw new Error("Invalid server response");
            }
            setUser(userData);
            localStorage.setItem("auth_user", JSON.stringify(userData));
            if (userData?.token) {
                try {
                    localStorage.setItem("auth_token", String(userData.token));
                } catch  {}
            }
            try {
                document.cookie = `auth_role=${userData.role}; Path=/; SameSite=Lax`;
            } catch  {}
            const next = userData.role === "vendor" ? "/vendor/portal" : userData.role === "contractor" ? "/contractor/dashboard" : "/manager/dashboard";
            console.log("[v0] Sign in successful, redirecting to:", next);
            router.push(next);
        } catch (err) {
            console.error("[v0] Sign in error:", err);
            throw err;
        } finally{
            setIsLoading(false);
        }
    };
    const signOut = ()=>{
        console.log("[v0] Signing out user");
        setUser(null);
        localStorage.removeItem("auth_user");
        try {
            document.cookie = "auth_role=; Path=/; Max-Age=0; SameSite=Lax";
        } catch  {}
        router.push("/");
    };
    const signInWithRole = async (email, password, role)=>{
        setIsLoading(true);
        try {
            let endpoint = "/api/auth/signin";
            if (role === "contractor") endpoint = "/api/auth/contractor/signin";
            if (role === "manager") endpoint = "/api/auth/manager/signin";
            if (role === "vendor") endpoint = "/api/auth/vendor/signin";
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            if (!response.ok) {
                let msg = "Sign in failed";
                try {
                    const e = await response.json();
                    msg = e.error || msg;
                } catch  {}
                throw new Error(msg);
            }
            let payload;
            try {
                payload = await response.json();
            } catch  {
                throw new Error("Invalid server response");
            }
            const userData = payload?.user || payload;
            if (userData?.role !== role) {
                throw new Error("Account role mismatch for this portal");
            }
            setUser(userData);
            localStorage.setItem("auth_user", JSON.stringify(userData));
            if (payload?.token) {
                try {
                    localStorage.setItem("auth_token", String(payload.token));
                } catch  {}
            }
            try {
                document.cookie = `auth_role=${userData.role}; Path=/; SameSite=Lax`;
            } catch  {}
            const next = userData.role === "vendor" ? "/vendor/portal" : userData.role === "contractor" ? "/contractor/dashboard" : "/manager/dashboard";
            router.push(next);
        } catch (err) {
            throw err;
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            signUp,
            signIn,
            signInWithRole,
            signOut
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth-context.tsx",
        lineNumber: 215,
        columnNumber: 10
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
}),
"[project]/lib/procurement-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProcurementProvider",
    ()=>ProcurementProvider,
    "useProcurements",
    ()=>useProcurements
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ProcurementContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ProcurementProvider({ children }) {
    const [procurements, setProcurements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const load = async ()=>{
            try {
                const res = await fetch("/api/procurements/public");
                if (res.ok) {
                    const items = await res.json();
                    if (Array.isArray(items)) setProcurements(items);
                }
            } catch  {}
        };
        void load();
    }, []);
    const revalidate = async ()=>{
        try {
            const res = await fetch("/api/procurements/public");
            if (res.ok) {
                const items = await res.json();
                if (Array.isArray(items)) setProcurements(items);
            }
        } catch  {}
    };
    const addProcurement = (procurement)=>{
        setProcurements((prev)=>[
                procurement,
                ...prev
            ]);
    };
    const getProcurement = (id)=>{
        return procurements.find((p)=>p.id === id);
    };
    const addQuote = async (procurementId, quote)=>{
        try {
            const res = await fetch(`/api/procurements/${procurementId}/quotes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(quote)
            });
            if (res.ok) {
                const saved = await res.json();
                setProcurements((prev)=>prev.map((p)=>p.id === procurementId ? {
                            ...p,
                            quotes: [
                                ...p.quotes,
                                saved
                            ],
                            status: "quoted"
                        } : p));
                await revalidate();
                return;
            }
        } catch  {}
        setProcurements((prev)=>prev.map((p)=>p.id === procurementId ? {
                    ...p,
                    quotes: [
                        ...p.quotes,
                        quote
                    ],
                    status: "quoted"
                } : p));
        await revalidate();
    };
    const getQuotes = (procurementId)=>{
        const procurement = getProcurement(procurementId);
        return procurement?.quotes || [];
    };
    const sendEmail = async (to, subject, html)=>{
        try {
            await fetch("/api/email/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to,
                    subject,
                    html
                })
            });
        } catch  {}
    };
    const selectQuote = async (procurementId, quoteId)=>{
        const procurement = getProcurement(procurementId);
        if (!procurement) return;
        const quote = procurement.quotes.find((q)=>q.id === quoteId);
        if (!quote) return;
        setProcurements((prev)=>prev.map((p)=>p.id === procurementId ? {
                    ...p,
                    selectedQuoteId: quoteId,
                    quotes: p.quotes.map((q)=>({
                            ...q,
                            status: q.id === quoteId ? "selected" : q.status
                        }))
                } : p));
        await revalidate();
        await sendEmail(quote.vendorEmail, "Interview Invitation", `<div>
        <p>Dear ${quote.vendorName},</p>
        <p>Your quote has been shortlisted for interview.</p>
        <p>Item: ${procurement.item}</p>
        <p>Total Price: ${quote.totalPrice}</p>
      </div>`);
    };
    const awardQuote = async (procurementId, quoteId)=>{
        const procurement = getProcurement(procurementId);
        if (!procurement) return;
        const quote = procurement.quotes.find((q)=>q.id === quoteId);
        if (!quote) return;
        setProcurements((prev)=>prev.map((p)=>p.id === procurementId ? {
                    ...p,
                    status: "awarded",
                    selectedQuoteId: quoteId,
                    quotes: p.quotes.map((q)=>({
                            ...q,
                            status: q.id === quoteId ? "selected" : q.status
                        }))
                } : p));
        await revalidate();
        await sendEmail(quote.vendorEmail, "Award of Contract", `<div>
        <p>Dear ${quote.vendorName},</p>
        <p>Your quote has been accepted.</p>
        <p>Item: ${procurement.item}</p>
        <p>Total Price: ${quote.totalPrice}</p>
        <p>Please proceed with delivery according to agreed terms.</p>
      </div>`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProcurementContext.Provider, {
        value: {
            procurements,
            addProcurement,
            getProcurement,
            addQuote,
            getQuotes,
            selectQuote,
            awardQuote
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/procurement-context.tsx",
        lineNumber: 183,
        columnNumber: 5
    }, this);
}
function useProcurements() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ProcurementContext);
    if (!context) {
        throw new Error("useProcurements must be used within ProcurementProvider");
    }
    return context;
}
}),
"[project]/lib/complaint-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ComplaintProvider",
    ()=>ComplaintProvider,
    "useComplaints",
    ()=>useComplaints
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ComplaintContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ComplaintProvider({ children }) {
    const [complaints, setComplaints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const addComplaint = async (complaint)=>{
        try {
            const res = await fetch("/api/complaints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(complaint)
            });
            if (res.ok) {
                const created = await res.json();
                setComplaints((prev)=>[
                        created,
                        ...prev
                    ]);
                return;
            }
        } catch  {}
        const fallback = {
            ...complaint,
            id: `complaint-${Date.now()}`,
            filedAt: new Date().toISOString(),
            activities: [],
            status: "open"
        };
        setComplaints((prev)=>[
                fallback,
                ...prev
            ]);
    };
    const getComplaint = (id)=>{
        return complaints.find((c)=>c.id === id);
    };
    const getComplaintsByProject = (projectId)=>{
        return complaints.filter((c)=>c.projectId === projectId);
    };
    const getComplaintsByContractor = (contractorId)=>{
        return complaints.filter((c)=>c.contractorId === contractorId);
    };
    const getComplaintsByManager = (managerId)=>{
        return complaints.filter((c)=>c.managerId === managerId);
    };
    const updateComplaintStatus = (id, status)=>{
        setComplaints((prev)=>prev.map((c)=>{
                if (c.id === id) {
                    const activity = {
                        id: `activity-${Date.now()}`,
                        complaintId: id,
                        action: "updated",
                        notes: `Status changed to ${status}`,
                        timestamp: new Date().toISOString()
                    };
                    return {
                        ...c,
                        status,
                        acknowledgedAt: status === "acknowledged" ? new Date().toISOString() : c.acknowledgedAt,
                        activities: [
                            ...c.activities,
                            activity
                        ]
                    };
                }
                return c;
            }));
    };
    const resolveComplaint = (id, resolution)=>{
        setComplaints((prev)=>prev.map((c)=>{
                if (c.id === id) {
                    const activity = {
                        id: `activity-${Date.now()}`,
                        complaintId: id,
                        action: "resolved",
                        notes: resolution,
                        timestamp: new Date().toISOString()
                    };
                    return {
                        ...c,
                        status: "resolved",
                        resolution,
                        resolvedAt: new Date().toISOString(),
                        activities: [
                            ...c.activities,
                            activity
                        ]
                    };
                }
                return c;
            }));
    };
    const addActivity = (complaintId, activity)=>{
        setComplaints((prev)=>prev.map((c)=>{
                if (c.id === complaintId) {
                    return {
                        ...c,
                        activities: [
                            ...c.activities,
                            {
                                ...activity,
                                id: `activity-${Date.now()}`
                            }
                        ]
                    };
                }
                return c;
            }));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ComplaintContext.Provider, {
        value: {
            complaints,
            addComplaint,
            getComplaint,
            getComplaintsByProject,
            getComplaintsByContractor,
            getComplaintsByManager,
            updateComplaintStatus,
            resolveComplaint,
            addActivity
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/complaint-context.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
function useComplaints() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ComplaintContext);
    if (!context) {
        throw new Error("useComplaints must be used within ComplaintProvider");
    }
    return context;
}
}),
"[project]/lib/payment-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PaymentProvider",
    ()=>PaymentProvider,
    "usePayments",
    ()=>usePayments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const PaymentContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function PaymentProvider({ children }) {
    const [payments, setPayments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const getToken = ()=>{
        if ("TURBOPACK compile-time truthy", 1) return "";
        //TURBOPACK unreachable
        ;
    };
    const refresh = async ()=>{
        try {
            const token = getToken();
            const res = await fetch("/api/manager/payments/requests", {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });
            if (res.ok) {
                const items = await res.json();
                if (Array.isArray(items)) setPayments(items);
            }
        } catch  {}
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void refresh();
    }, []);
    const approvePayment = async (id, reason)=>{
        try {
            const token = getToken();
            const res = await fetch(`/api/manager/payments/requests/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                },
                body: JSON.stringify({
                    status: "APPROVED",
                    reason
                })
            });
            if (res.ok) await refresh();
        } catch  {}
    };
    const getPaymentRequest = (id)=>payments.find((p)=>p.id === id);
    const getPendingRequests = ()=>payments.filter((p)=>p.status === "Pending");
    const getHistory = ()=>payments.filter((p)=>p.status !== "Pending");
    const declinePayment = async (id, reason)=>{
        try {
            const token = getToken();
            const res = await fetch(`/api/manager/payments/requests/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                },
                body: JSON.stringify({
                    status: "REJECTED",
                    reason
                })
            });
            if (res.ok) await refresh();
        } catch  {}
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PaymentContext.Provider, {
        value: {
            payments,
            refresh,
            getPaymentRequest,
            getPendingRequests,
            getHistory,
            approvePayment,
            declinePayment
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/payment-context.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
function usePayments() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PaymentContext);
    if (!ctx) {
        throw new Error("usePayments must be used within PaymentProvider");
    }
    return ctx;
}
}),
"[project]/hooks/use-toast.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
// Inspired by react-hot-toast library
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: 'ADD_TOAST',
    UPDATE_TOAST: 'UPDATE_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST'
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: 'REMOVE_TOAST',
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case 'UPDATE_TOAST':
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case 'DISMISS_TOAST':
            {
                const { toastId } = action;
                // ! Side effects ! - This could be extracted into a dismissToast() action,
                // but I'll keep it here for simplicity
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case 'REMOVE_TOAST':
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast({ ...props }) {
    const id = genId();
    const update = (props)=>dispatch({
            type: 'UPDATE_TOAST',
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: 'DISMISS_TOAST',
            toastId: id
        });
    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id: id,
        dismiss,
        update
    };
}
function useToast() {
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        listeners.push(setState);
        return ()=>{
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: 'DISMISS_TOAST',
                toastId
            })
    };
}
;
}),
"[project]/lib/bid-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BidProvider",
    ()=>BidProvider,
    "useBids",
    ()=>useBids
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-toast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$project$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/project-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const BidContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function BidProvider({ children }) {
    const [bids, setBids] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const { setProjectStatus, incrementBidCount, projects, updateProject } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$project$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProjects"])();
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const load = async ()=>{
            try {
                const res = await fetch("/api/bids");
                if (res.ok) {
                    const items = await res.json();
                    if (Array.isArray(items)) setBids(items);
                }
            } catch  {
                try {
                    const saved = localStorage.getItem("bids");
                    if (saved) {
                        const data = JSON.parse(saved);
                        if (Array.isArray(data)) setBids(data);
                    }
                } catch  {}
                try {
                    const evSaved = localStorage.getItem("bid_events");
                    if (evSaved) {
                        const ev = JSON.parse(evSaved);
                        if (Array.isArray(ev)) setEvents(ev);
                    }
                } catch  {}
            } finally{
                setIsLoaded(true);
            }
        };
        void load();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            localStorage.setItem("bids", JSON.stringify(bids));
        } catch  {}
    }, [
        bids
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            localStorage.setItem("bid_events", JSON.stringify(events));
        } catch  {}
    }, [
        events
    ]);
    // Reconcile legacy bids whose projectId stored as project title instead of ID
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        setBids((prev)=>{
            let changed = false;
            const next = prev.map((b)=>{
                const byId = projects.find((p)=>String(p.id) === String(b.projectId));
                if (byId) return b;
                const key = String(b.projectId).toLowerCase();
                const byTitle = projects.find((p)=>p.title && p.title.toLowerCase() === key);
                if (byTitle) {
                    changed = true;
                    return {
                        ...b,
                        projectId: String(byTitle.id)
                    };
                }
                return b;
            });
            return changed ? next : prev;
        });
    }, [
        isLoaded,
        projects
    ]);
    const getBidsByProject = (projectId)=>bids.filter((b)=>String(b.projectId) === String(projectId));
    const getEventsByProject = (projectId)=>events.filter((e)=>String(e.projectId) === String(projectId)).sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const getAllBids = ()=>bids;
    const getPendingBids = ()=>bids.filter((b)=>b.status === "New");
    const getBid = (id)=>bids.find((b)=>b.id === id);
    const updateBid = (id, updates)=>{
        let updated;
        setBids((prev)=>prev.map((b)=>{
                if (b.id === id) {
                    updated = {
                        ...b,
                        ...updates
                    };
                    return updated;
                }
                return b;
            }));
        return updated;
    };
    const updateBidStatus = async (id, status, reviewedBy, reviewNotes)=>{
        const optimistic = ()=>{
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, "0");
            const d = String(now.getDate()).padStart(2, "0");
            const h = String(now.getHours()).padStart(2, "0");
            const min = String(now.getMinutes()).padStart(2, "0");
            const updated = updateBid(id, {
                status,
                reviewedAt: now.toISOString(),
                recordDate: `${y}-${m}-${d}`,
                recordTime: `${h}:${min}`
            });
            return updated;
        };
        try {
            const res = await fetch(`/api/bids/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setBids((prev)=>{
                    let projectId = null;
                    const next = prev.map((b)=>{
                        if (b.id === id) {
                            projectId = b.projectId;
                            return updated;
                        }
                        if (status === "Accepted" && projectId !== null && String(b.projectId) === String(projectId)) {
                            return {
                                ...b,
                                status: "Rejected"
                            };
                        }
                        return b;
                    });
                    if (status === "Accepted" && projectId !== null) {
                        setProjectStatus(projectId, "Active");
                    }
                    return next;
                });
                return {
                    ok: true,
                    updated
                };
            }
            const msg = await res.json().catch(()=>({}));
            // Only fallback to local for "Reviewed" to avoid desync on decision errors
            if (status === "Reviewed") {
                const u = optimistic();
                return {
                    ok: false,
                    updated: u,
                    error: msg?.error || "Failed to update status"
                };
            }
            if (status === "Accepted") {
                setProjectStatus(optimistic()?.projectId || id, "Active");
            }
            return {
                ok: false,
                error: msg?.error || "Failed to update status"
            };
        } catch  {
            if (status === "Reviewed") {
                const u = optimistic();
                return {
                    ok: false,
                    updated: u,
                    error: "Network error"
                };
            }
            if (status === "Accepted") {
                setProjectStatus(optimistic()?.projectId || id, "Active");
            }
            return {
                ok: false,
                error: "Network error"
            };
        }
    };
    const deleteBid = (id)=>{
        setBids((prev)=>prev.filter((b)=>b.id !== id));
    };
    const submitBid = async (projectId, bid)=>{
        try {
            const res = await fetch(`/api/projects/${projectId}/bids`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bid)
            });
            if (res.ok) {
                const created = await res.json();
                setBids((prev)=>[
                        created,
                        ...prev
                    ]);
                incrementBidCount(projectId, 1);
                setEvents((prev)=>[
                        {
                            id: `evt-${Date.now()}`,
                            bidId: created.id,
                            projectId: created.projectId,
                            action: "submitted",
                            timestamp: new Date().toISOString()
                        },
                        ...prev
                    ]);
                try {
                    const p = projects.find((p)=>String(p.id) === String(projectId));
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"])({
                        title: "New bid submitted",
                        description: `${created.companyName} • ${p?.title || `Project ${projectId}`}`
                    });
                } catch  {}
                return {
                    ok: true,
                    created
                };
            }
            const msg = await res.json().catch(()=>({}));
            return {
                ok: false,
                error: msg?.error || "Failed to submit bid"
            };
        } catch  {}
        return {
            ok: false,
            error: "Network error"
        };
    };
    const sendEmail = async (to, subject, html)=>{
        try {
            await fetch("/api/email/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to,
                    subject,
                    html
                })
            });
        } catch  {}
    };
    const formatNairaAmount = (value)=>{
        const num = Number(String(value).replace(/[^0-9.]/g, "")) || 0;
        try {
            return new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0
            }).format(num);
        } catch  {
            return `₦${num.toLocaleString("en-NG")}`;
        }
    };
    const shortlistBid = async (projectId, bidId)=>{
        const countShortlisted = bids.filter((b)=>String(b.projectId) === String(projectId) && b.status === "Reviewed").length;
        if (countShortlisted >= 5) return;
        const existing = bids.find((b)=>b.id === bidId);
        if (existing && existing.status === "Reviewed") return;
        try {
            const res = await fetch(`/api/bids/${bidId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: "Reviewed"
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setBids((prev)=>prev.map((b)=>b.id === bidId ? updated : b));
            } else {
                setBids((prev)=>prev.map((b)=>{
                        if (b.id === bidId) {
                            const now = new Date();
                            const y = now.getFullYear();
                            const m = String(now.getMonth() + 1).padStart(2, "0");
                            const d = String(now.getDate()).padStart(2, "0");
                            const h = String(now.getHours()).padStart(2, "0");
                            const min = String(now.getMinutes()).padStart(2, "0");
                            return {
                                ...b,
                                status: "Reviewed",
                                reviewedAt: now.toISOString(),
                                recordDate: `${y}-${m}-${d}`,
                                recordTime: `${h}:${min}`
                            };
                        }
                        return b;
                    }));
            }
        } catch  {
            setBids((prev)=>prev.map((b)=>{
                    if (b.id === bidId) {
                        const now = new Date();
                        const y = now.getFullYear();
                        const m = String(now.getMonth() + 1).padStart(2, "0");
                        const d = String(now.getDate()).padStart(2, "0");
                        const h = String(now.getHours()).padStart(2, "0");
                        const min = String(now.getMinutes()).padStart(2, "0");
                        return {
                            ...b,
                            status: "Reviewed",
                            reviewedAt: now.toISOString(),
                            recordDate: `${y}-${m}-${d}`,
                            recordTime: `${h}:${min}`
                        };
                    }
                    return b;
                }));
        }
        setEvents((prev)=>[
                {
                    id: `evt-${Date.now()}`,
                    bidId,
                    projectId,
                    action: "shortlisted",
                    timestamp: new Date().toISOString()
                },
                ...prev
            ]);
        const bid = bids.find((b)=>b.id === bidId);
        if (bid) {
            const interviewUrl = `/interview/${projectId}`;
            await sendEmail(bid.email, "Interview Invitation", `<div><p>Dear ${bid.bidderName},</p><p>Your bid has been shortlisted for interview.</p><p>Join the interview: <a href="${interviewUrl}">${interviewUrl}</a></p><p>Amount: ${formatNairaAmount(bid.amount)}</p><p>Duration: ${bid.duration} days</p></div>`);
        }
    };
    const awardBid = async (projectId, bidId)=>{
        const getToken = ()=>{
            if ("TURBOPACK compile-time truthy", 1) return "";
            //TURBOPACK unreachable
            ;
        };
        const optimistic = ()=>{
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, "0");
            const d = String(now.getDate()).padStart(2, "0");
            const h = String(now.getHours()).padStart(2, "0");
            const min = String(now.getMinutes()).padStart(2, "0");
            setBids((prev)=>prev.map((b)=>{
                    if (b.id === bidId) return {
                        ...b,
                        status: "Awarded",
                        reviewedAt: now.toISOString(),
                        recordDate: `${y}-${m}-${d}`,
                        recordTime: `${h}:${min}`
                    };
                    return String(b.projectId) === String(projectId) ? {
                        ...b,
                        status: "Rejected",
                        reviewedAt: now.toISOString(),
                        recordDate: `${y}-${m}-${d}`,
                        recordTime: `${h}:${min}`
                    } : b;
                }));
            setProjectStatus(projectId, "Awarded");
        };
        try {
            const res = await fetch(`/api/bids/${bidId}/award`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    ownerName: "Manager"
                })
            });
            if (res.ok) {
                const data = await res.json();
                const contractSent = Boolean(data?.contractSent);
                const contractSentAt = String(data?.contractSentAt || "");
                setBids((prev)=>prev.map((b)=>b.id === bidId ? {
                            ...b,
                            status: "Awarded",
                            contractSent,
                            contractSentAt
                        } : String(b.projectId) === String(projectId) ? {
                            ...b,
                            status: "Rejected"
                        } : b));
                setProjectStatus(projectId, "Awarded");
                try {
                    const target = bids.find((b)=>b.id === bidId);
                    updateProject(projectId, {
                        acceptedBidDays: Number(target?.duration || 0) || undefined
                    });
                } catch  {}
            } else {
                optimistic();
            }
        } catch  {
            optimistic();
        }
        setEvents((prev)=>[
                {
                    id: `evt-${Date.now()}`,
                    bidId,
                    projectId,
                    action: "awarded",
                    timestamp: new Date().toISOString()
                },
                ...prev
            ]);
    };
    const logBidAction = (bidId, action, notes)=>{
        const bid = bids.find((b)=>b.id === bidId);
        const projectId = bid?.projectId || "";
        setEvents((prev)=>[
                {
                    id: `evt-${Date.now()}`,
                    bidId,
                    projectId,
                    action,
                    timestamp: new Date().toISOString(),
                    notes
                },
                ...prev
            ]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BidContext.Provider, {
        value: {
            bids,
            getBidsByProject,
            submitBid,
            shortlistBid,
            awardBid,
            isLoaded,
            getAllBids,
            getPendingBids,
            getBid,
            updateBid,
            updateBidStatus,
            deleteBid,
            logBidAction,
            getEventsByProject
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/bid-context.tsx",
        lineNumber: 381,
        columnNumber: 5
    }, this);
}
function useBids() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(BidContext);
    if (!context) {
        throw new Error("useBids must be used within BidProvider");
    }
    return context;
}
}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/components/ui/toast.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toast",
    ()=>Toast,
    "ToastAction",
    ()=>ToastAction,
    "ToastClose",
    ()=>ToastClose,
    "ToastDescription",
    ()=>ToastDescription,
    "ToastProvider",
    ()=>ToastProvider,
    "ToastTitle",
    ()=>ToastTitle,
    "ToastViewport",
    ()=>ToastViewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-toast/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const ToastProvider = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Provider"];
const ToastViewport = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastViewport.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"].displayName;
const toastVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full', {
    variants: {
        variant: {
            default: 'border bg-background text-foreground',
            destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
const Toast = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, variant, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(toastVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
Toast.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"].displayName;
const ToastAction = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastAction.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"].displayName;
const ToastClose = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600', className),
        "toast-close": "",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/components/ui/toast.tsx",
            lineNumber: 86,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 77,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastClose.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"].displayName;
const ToastTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-sm font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 95,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"].displayName;
const ToastDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-sm opacity-90', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 107,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"].displayName;
;
}),
"[project]/components/ui/toaster.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-toast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/toast.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function Toaster() {
    const { toasts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const params = new URLSearchParams(window.location.search);
            const shouldClear = params.get('clear') === '1';
            if (!shouldClear) return;
            try {
                localStorage.clear();
            } catch  {}
            try {
                sessionStorage.clear();
            } catch  {}
            try {
                if ('caches' in window) {
                    caches.keys().then((keys)=>keys.forEach((k)=>caches.delete(k))).catch(()=>{});
                }
            } catch  {}
            const url = new URL(window.location.href);
            url.searchParams.delete('clear');
            history.replaceState(null, '', url.toString());
            window.location.reload();
        } catch  {}
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastProvider"], {
        children: [
            toasts.map(function({ id, title, description, action, ...props }) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toast"], {
                    ...props,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-1",
                            children: [
                                title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastTitle"], {
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/toaster.tsx",
                                    lineNumber: 42,
                                    columnNumber: 25
                                }, this),
                                description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastDescription"], {
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/toaster.tsx",
                                    lineNumber: 44,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/toaster.tsx",
                            lineNumber: 41,
                            columnNumber: 13
                        }, this),
                        action,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastClose"], {}, void 0, false, {
                            fileName: "[project]/components/ui/toaster.tsx",
                            lineNumber: 48,
                            columnNumber: 13
                        }, this)
                    ]
                }, id, true, {
                    fileName: "[project]/components/ui/toaster.tsx",
                    lineNumber: 40,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastViewport"], {}, void 0, false, {
                fileName: "[project]/components/ui/toaster.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/toaster.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c3de3d00._.js.map