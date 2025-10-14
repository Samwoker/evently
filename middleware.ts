import { clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server';


const isPublicRoute = createRouteMatcher([
    '/',
    '/events/:id',
    '/sign-in',
    '/sign-up',
])
const ignoredRoutes = [
    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/api/uploadthing'
]
const isIgnoreRoute =(pathname:string)=>{
    return ignoredRoutes.some((route)=>pathname.startsWith(route))
}

export default clerkMiddleware(async (auth,req)=>{
    const {pathname} = req.nextUrl

    if(isIgnoreRoute(pathname)) return

    if(!isPublicRoute(req)){
    await auth.protect()
    }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
     "/((?!api/webhooks/clerk).*)",
  ],
};