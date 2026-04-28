import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

// Routes that don't require authentication
const publicRoutes = ['/', '/api/auth/login', '/api/auth/register', '/api/seed', '/api/schools'];

// Role-based route access
const roleRoutes: { [key: string]: string[] } = {
  superadmin: ['/dashboard/super-admin', '/dashboard/admin', '/dashboard/student', '/dashboard/forum', '/api/admin', '/api/bulk', '/api/schools', '/api/school', '/api/users'],
  'superadmin-assistant': ['/dashboard/admin', '/dashboard/student', '/dashboard/forum', '/api/admin', '/api/bulk', '/api/schools', '/api/school', '/api/users'],
  admin: ['/dashboard/admin', '/dashboard/student', '/dashboard/forum', '/api/admin', '/api/bulk', '/api/schools', '/api/school'],
  teacher: ['/dashboard/teacher', '/dashboard/student', '/dashboard/forum', '/api/teacher', '/api/bulk'],
  parent: ['/dashboard/parent', '/dashboard/student', '/dashboard/forum', '/api/parent'],
  student: ['/dashboard/student', '/dashboard/forum', '/api/student'],
  hod: ['/dashboard/hod', '/dashboard/forum', '/api/hod', '/api/bulk']
};

// Shared authenticated dashboard routes available to all roles
const sharedDashboardRoutes = ['/dashboard/forum'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies or header
  const token =
    request.cookies.get('classora_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // Redirect to login if no token
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verify JWT token
    const decoded = await jwtVerify(token, secret);
    const userId = decoded.payload.userId as string;
    const role = decoded.payload.role as string;

    // Check role-based access
    const allowedRoutes = [
      ...(roleRoutes[role] || []),
      ...sharedDashboardRoutes
    ];
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!isAllowed && pathname.startsWith('/dashboard')) {
      // Redirect to user's correct dashboard
      const dashboardMap: { [key: string]: string } = {
        superadmin: '/dashboard/super-admin',
        admin: '/dashboard/admin',
        teacher: '/dashboard/teacher',
        parent: '/dashboard/parent',
        student: '/dashboard/student',
        hod: '/dashboard/hod'
      };
      return NextResponse.redirect(
        new URL(dashboardMap[role] || '/', request.url)
      );
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-ID', userId);
    requestHeaders.set('X-User-Role', role);

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/admin/:path*',
    '/teacher/:path*',
    '/parent/:path*',
    '/student/:path*'
  ]
};
