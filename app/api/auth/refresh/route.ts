import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_HOST = process.env.API_HOST || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or request body
    const cookie = request.cookies.get('refresh-token')?.value;
    const body = await request.json().catch(() => ({}));
    const refreshToken = cookie || body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not provided' },
        { status: 400 }
      );
    }

    // Call Java backend to refresh token
    const response = await axios.post(
      `${API_HOST}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Platform': 'web',
        },
      }
    );

    const data = response.data;

    // Check if backend returned success
    if (data.responseStatus !== 'SUCCESS') {
      return NextResponse.json(
        { error: data.messages?.errorMessages?.[0] || 'Token refresh failed' },
        { status: 401 }
      );
    }

    const accessToken = data.payload?.accessToken;
    const newRefreshToken = data.payload?.refreshToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token in response' },
        { status: 500 }
      );
    }

    // Create response with new access token
    const res = NextResponse.json({
      accessToken,
      tokenType: data.payload?.tokenType || 'Bearer',
      expiresIn: data.payload?.expiresIn || 900,
    });

    // Set new access token cookie if provided by backend
    if (accessToken) {
      res.cookies.set('access-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 900, // 15 minutes
        path: '/',
      });
    }

    // Note: The Java backend should send the new refresh token via Set-Cookie header
    // which Next.js will automatically forward to the client

    return res;
  } catch (error: any) {
    console.error('Token refresh error:', error.message);

    // Backend errors should be passed through
    if (error.response?.data?.responseStatus === 'FAILURE') {
      return NextResponse.json(
        { error: error.response.data.messages?.errorMessages?.[0] || 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
