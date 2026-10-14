import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';
import { AppShell } from '@/components/app-layout/AppShell';
import { RequireAuth } from '@/components/app-layout/RequireAuth';
import { DiscoverPage } from '@/pages/app/DiscoverPage';
import { PlaceDetailPage } from '@/pages/app/PlaceDetailPage';
import { LoginPage } from '@/pages/app/LoginPage';
import { RegisterPage } from '@/pages/app/RegisterPage';
import { ShortlistPage } from '@/pages/app/ShortlistPage';
import { NewPlacePage } from '@/pages/app/NewPlacePage';
import { CommunityPage } from '@/pages/app/CommunityPage';
import { PostDetailPage } from '@/pages/app/PostDetailPage';
import { NewPostPage } from '@/pages/app/NewPostPage';
import { TripsPage } from '@/pages/app/TripsPage';
import { NewTripPage } from '@/pages/app/NewTripPage';
import { TripDetailPage } from '@/pages/app/TripDetailPage';
import { AccountPage } from '@/pages/app/AccountPage';
import { AdminPage } from '@/pages/app/AdminPage';
import { AuthProvider } from '@/hooks/useAuth';
import { SmoothScroll } from '@/providers/SmoothScroll';
import styles from './App.module.css';

/**
 * The cinematic marketing site — unchanged, still lives at `/`. Lenis smooth
 * scrolling is scoped to it: on the app pages it kept the previous page's
 * scroll position across route changes and fought native scrolling.
 */
function LandingLayout() {
  return (
    <SmoothScroll>
      <LandingContent />
    </SmoothScroll>
  );
}

function LandingContent() {
  return (
    <div className="landing">
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>

      <Header />

      <main id="main">
        <HomePage />
      </main>

      <Footer />
    </div>
  );
}

/** Signed-in only; guests go to login and come back afterwards. */
function guard(page: ReactNode) {
  return <RequireAuth>{page}</RequireAuth>;
}

/**
 * `/` keeps the landing exactly as-is. `/app/*` is the functional product
 * surface (auth, discover, place detail, ...) — a separate visual language,
 * see `styles/app.css`. Both share the same React app and token names.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingLayout />} />
          <Route path="/app" element={<Navigate to="/app/discover" replace />} />
          <Route path="/app/login" element={<LoginPage />} />
          <Route path="/app/register" element={<RegisterPage />} />
          <Route element={<AppShell />}>
            <Route path="/app/discover" element={<DiscoverPage />} />
            {/* `new` must match before the `:id` pattern. */}
            <Route path="/app/places/new" element={guard(<NewPlacePage />)} />
            <Route path="/app/places/:id" element={<PlaceDetailPage />} />
            <Route path="/app/community" element={<CommunityPage />} />
            <Route path="/app/community/new" element={guard(<NewPostPage />)} />
            <Route path="/app/community/:id" element={<PostDetailPage />} />
            <Route path="/app/trips" element={guard(<TripsPage />)} />
            <Route path="/app/trips/new" element={guard(<NewTripPage />)} />
            <Route path="/app/trips/:id" element={guard(<TripDetailPage />)} />
            <Route path="/app/shortlist" element={guard(<ShortlistPage />)} />
            <Route path="/app/account" element={guard(<AccountPage />)} />
            <Route
              path="/app/admin"
              element={
                <RequireAuth roles={['ADMIN', 'MANAGER']}>
                  <AdminPage />
                </RequireAuth>
              }
            />
            <Route path="/app/*" element={<Navigate to="/app/discover" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
