// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // نلوجو على الـ Token في الـ Cookies
    const token = request.cookies.get('admin_token')?.value;

    // 1. كان ما عندوش Token ويحب يدخل لأي باج (خاطي الـ login) -> نرجعوه للـ Login
    if (!token && !request.nextUrl.pathname.startsWith('/auth/login')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 2. كان عندو Token ومشى لباج الـ login بالغالط -> نرجعوه للـ Dashboard
    if (token && request.nextUrl.pathname.startsWith('/auth/login')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// هوني نحددو الـ Middleware وقتاش يخدم (نستثنيو ملفات الـ API والـ images باش ما يتبلوكاوش)
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|layout|favicon.ico).*)'],
};